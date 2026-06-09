import { useEffect, useRef, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from "@dnd-kit/core";
import BlockRenderer from "./BlockRenderer";
import { useDocument } from "../../context/DocumentContext";
import { useReadOnly } from "../../context/ReadOnlyContext";
import { SIZE_SPAN } from "../../types/block";
import type { Block } from "../../types/block";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";
import { COLS, ROWS, A4_WIDTH, A4_HEIGHT, PAGE_MARGIN, CELL_W, CELL_H } from "../../types/document";

export default function DocumentRenderer() {
  const [scale, setScale] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [draggingBlock, setDraggingBlock] = useState<Block | null>(null);
  const a4Ref = useRef<HTMLDivElement>(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const isReadOnly = useReadOnly();
  const { blocks, setSelectedBlockId, moveBlock } = useDocument();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale((prev) => Math.min(3, Math.max(0.3, prev - e.deltaY * 0.001)));
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  const getCell = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!a4Ref.current) return null;
    const rect = a4Ref.current.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - PAGE_MARGIN * scale) / (CELL_W * scale));
    const y = Math.floor((clientY - rect.top  - PAGE_MARGIN * scale) / (CELL_H * scale));
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
    return { x, y };
  };

  const canFit = (blockId: string, x: number, y: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return false;
    const { col: spanCol, row: spanRow } = SIZE_SPAN[block.size];
    if (x + spanCol > COLS || y + spanRow > ROWS) return false;
    return !blocks.some((b) => {
      if (b.id === blockId || !b.position) return false;
      const { col: bCol, row: bRow } = SIZE_SPAN[b.size];
      return (
        x < b.position.x + bCol && x + spanCol > b.position.x &&
        y < b.position.y + bRow && y + spanRow > b.position.y
      );
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const block = blocks.find((b) => b.id === event.active.id);
    setDraggingBlock(block ?? null);
    const e = event.activatorEvent as PointerEvent;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const x = startPointerRef.current.x + event.delta.x;
    const y = startPointerRef.current.y + event.delta.y;
    const cell = getCell(x, y);
    if (!cell) { setHoveredCell(null); return; }
    if (cell.x !== hoveredCell?.x || cell.y !== hoveredCell?.y) setHoveredCell(cell);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    const x = startPointerRef.current.x + event.delta.x;
    const y = startPointerRef.current.y + event.delta.y;
    const cell = getCell(x, y);
    if (cell && canFit(id, cell.x, cell.y)) moveBlock(id, cell.x, cell.y);
    setDraggingBlock(null);
    setHoveredCell(null);
  };

  const positionedBlocks = blocks.filter((b) => b.position);
  const unpositionedBlocks = blocks.filter((b) => !b.position);

  const draggingSpan = draggingBlock ? SIZE_SPAN[draggingBlock.size] : null;

  return (
    <div className="w-full min-h-full mt-10 flex items-start justify-center py-12">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setDraggingBlock(null); setHoveredCell(null); }}
      >
        <div
          ref={a4Ref}
          data-pdf-target
          onClick={() => setSelectedBlockId(null)}
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT,
            padding: PAGE_MARGIN,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.1s",
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_H}px)`,
          }}
          className="bg-base-100 shadow-xl"
        >
          {/* 그리드 셀 오버레이 — 블록 있을 때 + 편집 모드에서만 */}
          {blocks.length > 0 && !isReadOnly && Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              let isHovered = false;
              let isInvalid = false;
              if (hoveredCell && draggingSpan && draggingBlock) {
                const { col: sc, row: sr } = draggingSpan;
                if (col >= hoveredCell.x && col < hoveredCell.x + sc &&
                    row >= hoveredCell.y && row < hoveredCell.y + sr) {
                  isHovered = true;
                  isInvalid = !canFit(draggingBlock.id, hoveredCell.x, hoveredCell.y);
                }
              }
              return (
                <div
                  key={`${col}-${row}`}
                  style={{ gridColumn: col + 1, gridRow: row + 1, zIndex: 5, pointerEvents: "none" }}
                  className={`border border-dashed transition-colors duration-150 ${
                    isHovered
                      ? isInvalid ? "border-error bg-error/20" : "border-primary bg-primary/20 shadow-inner"
                      : "border-base-content/10"
                  }`}
                />
              );
            })
          )}

          {/* 배치된 블록 */}
          {positionedBlocks.map((block) => {
            const { col, row } = SIZE_SPAN[block.size];
            return (
              <div
                key={block.id}
                style={{ gridColumn: `${block.position!.x + 1} / span ${col}`, gridRow: `${block.position!.y + 1} / span ${row}`, zIndex: 10 }}
                onClick={(e) => e.stopPropagation()}
              >
                <BlockRenderer block={block} />
              </div>
            );
          })}

          {/* 위치 미지정 블록 */}
          {unpositionedBlocks.length > 0 && (
            <div style={{ gridColumn: "1 / -1", gridRow: `${ROWS}`, zIndex: 10 }} className="flex flex-wrap">
              {unpositionedBlocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
            </div>
          )}

          {blocks.length === 0 && !isReadOnly && (
            <div style={{ gridColumn: "1 / -1", gridRow: "1" }} className="flex justify-center items-start pt-8 text-base-content/30 text-sm">
              왼쪽 사이드바에서 블록을 추가하세요
            </div>
          )}
        </div>

        {/* 커스텀 드래그 오버레이 */}
        <DragOverlay dropAnimation={null}>
          {draggingBlock && (() => {
            const { col, row } = SIZE_SPAN[draggingBlock.size];
            const def = BLOCK_DEFINITIONS.find((d: { type: string }) => d.type === draggingBlock.type);
            if (!def) return null;
            const Component = def.component;
            return (
              <div
                style={{ width: CELL_W * col * scale, height: CELL_H * row * scale, opacity: 0.85, overflow: "hidden" }}
                className="rounded-md border-2 border-primary shadow-2xl bg-base-100"
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: CELL_W * col, height: CELL_H * row }}>
                  <Component block={draggingBlock} />
                </div>
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
