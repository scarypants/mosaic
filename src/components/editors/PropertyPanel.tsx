import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";
import type { BlockStyle } from "../../types/block";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";

/** 글씨 크기 선택 옵션 — value "" 는 "지정 안 함"(블록 기본값 사용)을 뜻함 */
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

/** 글씨 굵기 선택 옵션 (Light / Normal / Bold) */
const FONT_WEIGHTS: { label: string; value: BlockStyle["fontWeight"] }[] = [
  { label: "Light",  value: "light" },
  { label: "Normal", value: "normal" },
  { label: "Bold",   value: "bold" },
]

/** 정렬 버튼 옵션 (왼쪽/가운데/오른쪽) */
const ALIGN_OPTIONS: { icon: React.ReactNode; value: NonNullable<BlockStyle["textAlign"]> }[] = [
  { icon: <AlignLeft size={15} />,   value: "left" },
  { icon: <AlignCenter size={15} />, value: "center" },
  { icon: <AlignRight size={15} />,  value: "right" },
]

/**
 * PropertyPanel (블록 속성 편집 패널)
 * - 선택된 블록의 글씨 크기/굵기/정렬/테두리를 수정
 * - 선택된 블록이 없으면 아무것도 렌더하지 않음
 * - 정렬은 블록 종류별 기본값(defaultAlign)을 기준으로 표시 (예: 제목 블록은 가운데가 기본)
 */
export default function PropertyPanel() {
  const { selectedBlockId, blocks, updateBlockStyle } = useDocument()
  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null

  if (!selectedBlock) return null   // 선택된 블록이 없으면 패널 숨김

  const style = selectedBlock.style ?? {}
  /**
   * 선택된 블록의 스타일을 부분 갱신하는 헬퍼
   * @param patch 변경할 스타일 속성만 담은 객체 (기존 스타일과 병합됨)
   */
  const update = (patch: Partial<BlockStyle>) => updateBlockStyle(selectedBlock.id, patch)

  // 블록 정의에서 기본 정렬을 가져옴 — 정렬을 따로 지정하지 않았을 때 표시 기준
  const definition = BLOCK_DEFINITIONS.find((d) => d.type === selectedBlock.type)
  const defaultAlign = definition?.defaultAlign ?? "left"

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

      {/* 정렬 — 현재 값이 없으면 블록 기본값(defaultAlign)을 선택 상태로 표시 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-base-content/60">정렬</label>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(({ icon, value }) => (
            <button
              key={value}
              onClick={() => update({ textAlign: value })}
              className={`btn btn-sm flex-1 ${(style.textAlign ?? defaultAlign) === value ? "btn-primary" : "bg-base-100"}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* 테두리 표시 토글 (기본값 켜짐) */}
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
