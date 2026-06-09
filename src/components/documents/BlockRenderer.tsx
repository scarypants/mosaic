import { useDraggable } from "@dnd-kit/core";
import { useDocument } from "../../context/DocumentContext";
import { useReadOnly } from "../../context/ReadOnlyContext";
import type { Block } from "../../types/block";
import { SIZE_SPAN } from "../../types/block";
import { CELL_W, CELL_H } from "../../types/document";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";

/**
 * BlockRenderer (블록 공통 래퍼)
 * - 블록 타입에 맞는 실제 컴포넌트를 찾아 렌더하고, 공통 동작/스타일을 입힌다.
 * - 크기(grid span), 드래그(dnd-kit), 선택 상태, 속성(글꼴/정렬/테두리) 적용을 담당
 * - 읽기 전용(미리보기)에서는 드래그·선택을 끄고 PDF용 스타일을 적용
 */
export default function BlockRenderer({ block }: { block: Block }) {
  const { selectedBlockId, setSelectedBlockId } = useDocument()
  const isReadOnly = useReadOnly()
  const definition = BLOCK_DEFINITIONS.find((d) => d.type === block.type)
  if (!definition) return null   // 정의 없는(알 수 없는) 타입은 렌더하지 않음

  const Component = definition.component   // 실제 블록 컴포넌트 (TitleBlock 등)
  const { col, row } = SIZE_SPAN[block.size]   // 크기 → 차지하는 셀 수

  // dnd-kit 드래그 설정 — 읽기 전용에서는 비활성화
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    disabled: isReadOnly,
    data: { block },
  })

  // 블록 클릭 시 선택 (부모의 "빈 곳 클릭 → 선택 해제"로 전파되지 않도록 stopPropagation)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedBlockId(block.id)
  }

  const isSelected = selectedBlockId === block.id
  // 속성 패널에서 지정한 스타일을 CSS 클래스로 변환 (미지정 시 클래스 없음 → 블록 기본값 사용)
  const blockStyle = block.style ?? {}
  const showBorder = blockStyle.showBorder ?? true   // 테두리 표시 기본값 true
  const fontSizeClass = blockStyle.fontSize ? `block-text-${blockStyle.fontSize}` : ""
  const fontWeightClass = blockStyle.fontWeight ? `font-${blockStyle.fontWeight}` : ""
  const textAlignClass = blockStyle.textAlign ? `block-align-${blockStyle.textAlign}` : ""

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ width: CELL_W * col, height: CELL_H * row }}
      onClick={isReadOnly ? undefined : handleClick}
      className={`box-border overflow-hidden rounded-md transition-all bg-base-100
        ${fontSizeClass} ${fontWeightClass} ${textAlignClass}
        ${isDragging ? "opacity-20" : ""}
        ${isReadOnly
          ? `preview-block ${showBorder ? "border border-base-300" : ""}`
          : `border cursor-grab active:cursor-grabbing
            ${isSelected
              ? "ring-2 ring-primary border-primary shadow-md"
              : showBorder ? "border-base-300 shadow-sm" : "border-transparent"}`
        }`}
    >
      <Component block={block} />
    </div>
  )
}
