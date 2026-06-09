import { useDraggable } from "@dnd-kit/core";
import { useDocument } from "../../context/DocumentContext";
import { useReadOnly } from "../../context/ReadOnlyContext";
import type { Block } from "../../types/block";
import { SIZE_SPAN } from "../../types/block";
import { CELL_W, CELL_H } from "../../types/document";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";

export default function BlockRenderer({ block }: { block: Block }) {
  const { selectedBlockId, setSelectedBlockId } = useDocument()
  const isReadOnly = useReadOnly()
  const definition = BLOCK_DEFINITIONS.find((d) => d.type === block.type)
  if (!definition) return null

  const Component = definition.component
  const { col, row } = SIZE_SPAN[block.size]

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    disabled: isReadOnly,
    data: { block },
  })

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedBlockId(block.id)
  }

  const isSelected = selectedBlockId === block.id
  const blockStyle = block.style ?? {}
  const showBorder = blockStyle.showBorder ?? true
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
