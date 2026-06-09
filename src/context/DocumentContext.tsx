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

// crypto.randomUUID는 보안 컨텍스트에서만 동작하므로 폴백 제공
function genId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* 비보안 컨텍스트 등 — 폴백 사용 */ }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const VALID_TYPES = new Set(BLOCK_DEFINITIONS.map((d) => d.type))
const VALID_SIZES = new Set(["S", "M", "L", "XL"])

// 외부에서 들어온 blocks(파일/로컬스토리지)가 올바른 구조인지 검증
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

function sanitizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) throw new Error("blocks가 배열이 아닙니다.")
  const valid = input.filter(isValidBlock)
  if (valid.length === 0) throw new Error("유효한 블록이 없습니다.")
  return valid
}

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

  // 저장된 최근 문서가 있는지 확인 (홈의 "Recent File" 활성화 판단)
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

  // 로컬스토리지의 자동저장본을 불러옴 — 성공 시 true (손상 항목은 검증으로 걸러냄)
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

  // [기능] 블록 추가 — 그리드에서 빈 자리를 찾아 새 블록을 배치
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

  // [기능] 블록 내용(data) 부분 갱신 — 입력 필드 변경 시 사용
  const updateBlockData = (id: string, data: Partial<Block["data"]>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, data: { ...block.data, ...data } } as Block : block)
    )
  }

  // [기능] 블록 스타일(style) 부분 갱신 — 속성 패널에서 사용
  const updateBlockStyle = (id: string, style: Partial<BlockStyle>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, style: { ...block.style, ...style } } : block)
    )
  }

  // [기능] 블록 삭제
  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  // [기능] 블록 이동 — 드래그&드롭으로 결정된 새 그리드 좌표로 position 갱신
  const moveBlock = (id: string, x: number, y: number) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? {...block, position: {x, y}} : block))
    )
  }

  // 외부 데이터를 받으므로 검증 후 적용 — 잘못된 구조면 throw하여 호출측에서 toast 처리
  const importBlocks = (newBlocks: unknown) => {
    const sanitized = sanitizeBlocks(newBlocks)
    setBlocks(sanitized)
    setSelectedBlockId(null)
  }

  // [기능] 문서 비우기 — 블록과 자동저장본을 모두 제거 (새 문서/템플릿 변경 시)
  const clearBlocks = () => {
    setBlocks([])
    setSelectedBlockId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn("localStorage 삭제 실패:", err)
    }
  }

  // [기능] 템플릿 로드 — 템플릿 정의대로 새 블록들을 생성해 문서를 구성
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

// 문서 컨텍스트 접근 훅 — Provider 밖에서 쓰면 즉시 에러로 알림
// eslint-disable-next-line react-refresh/only-export-components
export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error("useDocument must be used within DocumentProvider");
  return context;
}