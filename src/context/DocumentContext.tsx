// 문서 전역 상태(Context)
// - 블록 목록(blocks), 선택 상태, 토스트 메시지를 앱 전체에 제공
// - 블록 추가/수정/이동/삭제, 템플릿 로드, 파일/로컬스토리지 입출력, 자동저장을 담당
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { type Block, type BlockType, type BlockSize, type BlockStyle, SIZE_SPAN } from "../types/block";
import { BLOCK_DEFINITIONS } from "../data/blockDefinitions";
import { COLS, ROWS } from "../types/document";
import { TEMPLATES, type TemplateName } from "../data/templates";

const STORAGE_KEY = "mosaic_autosave"   // 자동저장에 쓰는 localStorage 키

/**
 * 블록 고유 ID 생성
 * - crypto.randomUUID는 HTTPS 등 보안 컨텍스트에서만 동작하므로,
 *   사용 불가 시 timestamp + 랜덤 문자열로 대체 ID를 만든다.
 * @returns 블록을 식별하는 고유 문자열
 */
function genId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  } catch { 
    /* 비보안 컨텍스트 등 — 폴백 사용 */ 
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const VALID_TYPES = new Set(BLOCK_DEFINITIONS.map((d) => d.type))
const VALID_SIZES = new Set(["S", "M", "L", "XL"])

/**
 * 외부에서 들어온 블록 하나가 올바른 구조인지 검증 (타입 가드)
 * - 파일(.mosaic)/로컬스토리지에서 읽은 데이터를 신뢰하지 않고,
 *   id·type·size·data 등 필수 필드와 허용된 값인지 확인한다.
 * @param b 검증할 임의의 값
 * @returns 유효한 Block 이면 true (이후 Block 타입으로 좁혀짐)
 */
function isValidBlock(b: unknown): b is Block {
  if (!b || typeof b !== "object") return false
  const block = b as Record<string, unknown>
  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    VALID_TYPES.has(block.type as Block["type"]) &&
    typeof block.size === "string" &&
    VALID_SIZES.has(block.size) &&
    typeof block.data === "object" && block.data !== null
  )
}

/**
 * 블록 배열을 정제 — 유효한 블록만 남기고 나머지는 걸러낸다.
 * @param input 검증할 임의의 값 (보통 파싱된 blocks 배열)
 * @returns 유효한 블록만 담긴 배열
 * @throws 배열이 아니거나 유효한 블록이 하나도 없으면 에러
 */
function sanitizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) throw new Error("blocks가 배열이 아닙니다.")
  const valid = input.filter(isValidBlock)
  if (valid.length === 0) throw new Error("유효한 블록이 없습니다.")
  return valid
}

/**
 * 문서 컨텍스트가 하위 트리에 제공하는 값의 형태
 * - 상태(blocks, selectedBlockId)와 이를 조작하는 함수들을 모아 정의
 */
interface DocumentContextType {
  blocks: Block[]
  selectedBlockId: string | null
  setSelectedBlockId: (id: string | null) => void
  addBlock: (type: BlockType, size: BlockSize) => void
  updateBlockData: (id: string, data: Partial<Block["data"]>) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, x: number, y: number) => void
  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void
  importBlocks: (blocks: unknown) => void
  loadFromStorage: () => boolean
  hasSavedData: () => boolean
  loadTemplate: (name: TemplateName) => void
  clearBlocks: () => void
  setToastMsg: (msg: string | null) => void
}

const DocumentContext = createContext<DocumentContextType | null>(null);

/**
 * DocumentProvider — 문서 상태와 조작 함수들을 하위 트리에 제공하는 Provider.
 * App 최상단에서 감싸므로 모든 페이지/컴포넌트가 useDocument() 로 접근 가능.
 */
export function DocumentProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Block[]>([])                       // 문서의 모든 블록
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)  // 현재 선택된 블록
  const [toastMsg, setToastMsg] = useState<string | null>(null)          // 전역 토스트 메시지

  // 블록이 있을 때만 자동저장 (용량 초과 등 실패해도 앱이 죽지 않도록 try/catch)
  useEffect(() => {
    if (blocks.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks, savedAt: new Date().toISOString() }))
    } catch (err) {
      // 큰 이미지(base64) 등으로 localStorage 용량을 초과하면 여기로 옴.
      // 자동저장만 건너뛰고 인메모리 blocks는 유지되어 .mosaic 저장/내보내기는 정상 동작.
      console.warn("자동저장 실패 (localStorage 용량 초과 가능):", err)
    }
  }, [blocks])

  /**
   * 저장된 최근 문서가 있는지 확인 (홈의 "Recent File" 버튼 활성화 판단에 사용)
   * @returns 자동저장된 블록이 1개 이상이면 true
   */
  const hasSavedData = (): boolean => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      return Array.isArray(data.blocks) && data.blocks.length > 0
    } catch {
      return false
    }
  }

  /**
   * 로컬스토리지의 자동저장본을 불러와 현재 문서로 설정
   * - 손상되었거나 형식이 안 맞는 항목은 sanitizeBlocks 로 걸러낸다.
   * @returns 불러오기에 성공하면 true, 저장본이 없거나 실패하면 false
   */
  const loadFromStorage = (): boolean => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      const sanitized = sanitizeBlocks(data.blocks)  // 손상된 항목 필터링
      setBlocks(sanitized)
      setSelectedBlockId(null)
      return true
    } catch {
      return false
    }
  }

  /**
   * 블록 추가 — 그리드에서 겹치지 않는 빈 자리를 찾아 새 블록을 배치한다.
   * 빈 공간이 없으면 추가하지 않고 토스트로 안내한다.
   * @param type 추가할 블록 종류 (예: "title", "profile")
   * @param size 블록 크기 (S/M/L/XL)
   */
  const addBlock = (type: BlockType, size: BlockSize) => {
    const definition = BLOCK_DEFINITIONS.find((d) => d.type === type)
    if (!definition) return

    const { col: spanCol, row: spanRow } = SIZE_SPAN[size]

    // 좌상단부터 한 칸씩 훑어 블록이 들어갈 빈 영역의 좌표를 반환 (없으면 null)
    const findPosition = (currentBlocks: Block[]) => {
      for (let y = 0; y <= ROWS - spanRow; y++) {
        for (let x = 0; x <= COLS - spanCol; x++) {
          const occupied = currentBlocks.some((b) => {
            if (!b.position) return false
            const { col, row } = SIZE_SPAN[b.size]
            return (
              x < b.position.x + col &&
              x + spanCol > b.position.x &&
              y < b.position.y + row &&
              y + spanRow > b.position.y
            )
          })
          if (!occupied) return { x, y }
        }
      }
      return null
    }

    setBlocks((prev) => {
      const position = findPosition(prev) ?? undefined;
      if (!position) {
        // 빈 자리가 없으면 추가하지 않고 안내
        setToastMsg("그리드에 공간이 부족합니다.")
        setTimeout(() => setToastMsg(null), 3000)
        return prev
      }
      return [
        ...prev,
        {
          id: genId(),
          type,
          label: definition.label,
          size,
          position,
          data: structuredClone(definition.defaultData),  // 기본 데이터를 깊은 복사해 블록 간 공유 방지
        } as Block,
      ];
    });
  };

  /**
   * 블록 내용(data) 부분 갱신 — 입력 필드가 바뀔 때마다 호출
   * @param id 대상 블록 ID
   * @param data 갱신할 필드만 담은 부분 객체 (기존 data 와 병합됨)
   */
  const updateBlockData = (id: string, data: Partial<Block["data"]>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, data: { ...block.data, ...data } } as Block : block)
    )
  }

  /**
   * 블록 스타일(style) 부분 갱신 — 속성 패널에서 글꼴/정렬/테두리 변경 시 호출
   * @param id 대상 블록 ID
   * @param style 갱신할 스타일 속성만 담은 부분 객체 (기존 style 과 병합됨)
   */
  const updateBlockStyle = (id: string, style: Partial<BlockStyle>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, style: { ...block.style, ...style } } : block)
    )
  }

  /**
   * 블록 삭제
   * @param id 삭제할 블록 ID
   */
  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  /**
   * 블록 이동 — 드래그&드롭으로 결정된 새 그리드 좌표로 position 을 갱신
   * @param id 이동할 블록 ID
   * @param x 새 그리드 X 좌표 (0~3)
   * @param y 새 그리드 Y 좌표 (0~5)
   */
  const moveBlock = (id: string, x: number, y: number) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? {...block, position: {x, y}} : block))
    )
  }

  /**
   * 외부 블록 데이터를 가져와 현재 문서를 교체 (.mosaic 가져오기 등)
   * - 외부 입력이므로 검증 후 적용하며, 구조가 잘못되면 throw 하여 호출측에서 토스트 처리한다.
   * @param newBlocks 가져올 블록 배열(검증 전)
   * @throws 유효한 블록이 없으면 sanitizeBlocks 가 에러를 던짐
   */
  const importBlocks = (newBlocks: unknown) => {
    const sanitized = sanitizeBlocks(newBlocks)
    setBlocks(sanitized)
    setSelectedBlockId(null)
  }

  /**
   * 문서 비우기 — 블록과 자동저장본을 모두 제거 (새 문서 시작/템플릿 변경 시)
   */
  const clearBlocks = () => {
    setBlocks([])
    setSelectedBlockId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn("localStorage 삭제 실패:", err)
    }
  }

  /**
   * 템플릿 로드 — 템플릿 정의(TEMPLATES)대로 새 블록들을 생성해 문서를 구성
   * @param name 적용할 템플릿 이름 (예: "resume", "portfolio")
   */
  const loadTemplate = (name: TemplateName) => {
    const template = TEMPLATES[name]
    if (!template) {
      setToastMsg("템플릿을 찾을 수 없습니다.")
      setTimeout(() => setToastMsg(null), 3000)
      return
    }
    try {
      const newBlocks: Block[] = template.map((item) => {
        const definition = BLOCK_DEFINITIONS.find((d) => d.type === item.type)
        if (!definition) throw new Error(`Unknown block type: ${item.type}`)
        return {
          id: genId(),
          type: item.type,
          label: definition.label,
          size: item.size,
          position: item.position,
          data: structuredClone(definition.defaultData),
        } as Block
      })
      setBlocks(newBlocks)
    } catch (err) {
      console.error("템플릿 로드 실패:", err)
      setToastMsg("템플릿을 불러오지 못했습니다.")
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  return (
    <DocumentContext.Provider
      value={{
        blocks,
        selectedBlockId,
        setSelectedBlockId,
        addBlock,
        updateBlockData,
        updateBlockStyle,
        importBlocks,
        loadFromStorage,
        hasSavedData,
        removeBlock,
        moveBlock,
        loadTemplate,
        clearBlocks,
        setToastMsg,
      }}>
      {children}
      {/* 전역 토스트 — 어느 화면에서든 안내 메시지를 화면 상단 중앙에 표시 */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-info">
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </DocumentContext.Provider>
  )
}

/**
 * 문서 컨텍스트 접근 훅 — 컴포넌트에서 문서 상태와 조작 함수를 꺼내 쓸 때 사용.
 * DocumentProvider 밖에서 호출하면 즉시 에러를 던져 잘못된 사용을 알린다.
 * @returns 문서 상태와 blocks 조작 함수들이 담긴 객체
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error("useDocument must be used within DocumentProvider");
  return context;
}