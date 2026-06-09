import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";
import type { BlockStyle } from "../../types/block";

const FONT_SIZES: { label: string; value: BlockStyle["fontSize"] | "" }[] = [
  { label: "기본값",        value: "" },
  { label: "XS  (10px)",   value: "xs" },
  { label: "S   (13px)",   value: "sm" },
  { label: "M   (16px)",   value: "base" },
  { label: "L   (19px)",   value: "lg" },
  { label: "XL  (24px)",   value: "xl" },
  { label: "2XL (32px)",   value: "2xl" },
  { label: "3XL (48px)",   value: "3xl" },
]

const FONT_WEIGHTS: { label: string; value: BlockStyle["fontWeight"] }[] = [
  { label: "Light",  value: "light" },
  { label: "Normal", value: "normal" },
  { label: "Bold",   value: "bold" },
]

const ALIGN_OPTIONS: { icon: React.ReactNode; value: NonNullable<BlockStyle["textAlign"]> }[] = [
  { icon: <AlignLeft size={15} />,   value: "left" },
  { icon: <AlignCenter size={15} />, value: "center" },
  { icon: <AlignRight size={15} />,  value: "right" },
]

export default function PropertyPanel() {
  const { selectedBlockId, blocks, updateBlockStyle } = useDocument()
  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null

  if (!selectedBlock) return null

  const style = selectedBlock.style ?? {}
  const update = (patch: Partial<BlockStyle>) => updateBlockStyle(selectedBlock.id, patch)

  return (
    <div className="bg-base-300 rounded-box w-56 p-5 h-[calc(100vh-8rem)] flex flex-col gap-5 overflow-y-auto">
      <h1 className="font-bold text-xl">속성</h1>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-base-content/60">블록 타입</label>
        <input type="text" className="input input-sm" readOnly value={selectedBlock.label} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-base-content/60">글씨 크기</label>
        <select
          className="select select-sm"
          value={style.fontSize ?? ""}
          onChange={(e) => update({ fontSize: (e.target.value || undefined) as BlockStyle["fontSize"] })}
        >
          {FONT_SIZES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-base-content/60">글씨 굵기</label>
        <select
          className="select select-sm"
          value={style.fontWeight ?? "normal"}
          onChange={(e) => update({ fontWeight: e.target.value as BlockStyle["fontWeight"] })}
        >
          {FONT_WEIGHTS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-base-content/60">정렬</label>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(({ icon, value }) => (
            <button
              key={value}
              onClick={() => update({ textAlign: value })}
              className={`btn btn-sm flex-1 ${(style.textAlign ?? "left") === value ? "btn-primary" : "bg-base-100"}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-base-content/60">테두리</label>
        <input
          type="checkbox"
          className="toggle toggle-sm toggle-primary"
          checked={style.showBorder ?? true}
          onChange={(e) => update({ showBorder: e.target.checked })}
        />
      </div>
    </div>
  );
}
