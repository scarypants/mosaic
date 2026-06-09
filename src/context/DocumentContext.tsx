import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { type Block, type BlockType, type BlockSize, type BlockStyle, SIZE_SPAN } from "../types/block";
import { BLOCK_DEFINITIONS } from "../data/blockDefinitions";
import { COLS, ROWS } from "../types/document";
import { TEMPLATES, type TemplateName } from "../data/templates";

const STORAGE_KEY = "mosaic_autosave"

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

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

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

  const addBlock = (type: BlockType, size: BlockSize) => {
    const definition = BLOCK_DEFINITIONS.find((d) => d.type === type)
    if (!definition) return

    const { col: spanCol, row: spanRow } = SIZE_SPAN[size]

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
          data: structuredClone(definition.defaultData),
        } as Block,
      ];
    });
  };

  const updateBlockData = (id: string, data: Partial<Block["data"]>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, data: { ...block.data, ...data } } as Block : block)
    )
  }

  const updateBlockStyle = (id: string, style: Partial<BlockStyle>) => {
    setBlocks((prev) =>
      prev.map((block) => block.id === id ? { ...block, style: { ...block.style, ...style } } : block)
    )
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

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

  const clearBlocks = () => {
    setBlocks([])
    setSelectedBlockId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn("localStorage 삭제 실패:", err)
    }
  }

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

// eslint-disable-next-line react-refresh/only-export-components
export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error("useDocument must be used within DocumentProvider");
  return context;
}