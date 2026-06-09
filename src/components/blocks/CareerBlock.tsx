import { useDocument } from "../../context/DocumentContext";
import { useReadOnly } from "../../context/ReadOnlyContext";
import type { props } from "../../types/block";
import type { CareerBlockData } from "../../types/blockData";

// 기간 입력 형식 검증 (YYYY.MM.)
const PERIOD_PATTERN = "[0-9]{4}\\.[0-9]{2}\\.?"
const PERIOD_TITLE = "YYYY.MM. 형식으로 입력하세요 (예: 2020.03.)"

/**
 * CareerBlock (경력 블록)
 * - 여러 경력 항목(items 배열)을 표 형태로 입력
 * - L 사이즈: 기간/근무처/직위 3열 표, XL 사이즈: 직무·직급·세부설명까지 상세 입력
 * - 읽기 전용(미리보기)에서는 비어 있는 기간의 "~" 구분자를 숨김
 */
export default function CareerBlock({ block }: props) {
  const { updateBlockData } = useDocument()
  const isReadOnly = useReadOnly()

  if (block.type !== "career") return null   // 타입 가드
  const { items } = block.data

  // [기능] 특정 항목(index)의 특정 필드(field)만 갱신
  // items 배열을 불변 방식으로 복사하면서 해당 항목만 교체
  const handleChange = (index: number, field: keyof CareerBlockData["items"][number]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, [field]: e.target.value } : item
      );
      updateBlockData(block.id, { items: newItems });
    };

  // 블록 크기별 레이아웃 반환 (L: 표 / XL: 상세 카드)
  const renderContentBySize = () => {
    switch (block.size) {
      case "L":
        return (
          <div className="flex h-full">
            <div className="flex items-center justify-center w-14 border-r border-base-300 shrink-0">
              <span className="text-sm font-medium">경력</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="grid grid-cols-3 border-b border-base-300 bg-base-200/50 shrink-0 divide-x divide-base-300">
                <p className="text-xs font-medium text-center py-2">기간</p>
                <p className="text-xs font-medium text-center py-2">근무처</p>
                <p className="text-xs font-medium text-center py-2">직위</p>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-3 border-t border-base-200 flex-1 items-stretch divide-x divide-base-200">
                  <div className="flex items-center gap-1 p-1">
                    <input type="text" value={item.periodStart} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodStart")} className="field-validate w-full text-sm focus:outline-none min-w-0" />
                    {!(isReadOnly && !item.periodStart && !item.periodEnd) && <span className="text-xs shrink-0">~</span>}
                    <input type="text" value={item.periodEnd} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodEnd")} className="field-validate w-full text-sm focus:outline-none min-w-0" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.company} placeholder="근무처" onChange={handleChange(index, "company")} className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.role} placeholder="직위" onChange={handleChange(index, "role")} className="w-full text-sm focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case "XL":
        return (
          <div className="p-4 flex flex-col gap-2">
            <p className="font-bold text-sm">경력</p>
            {items.slice(0, 2).map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 border-t border-base-200 pt-2">
                <div className="gap-1">
                  <span className="text-xs text-base-content/60">기간</span>
                  <div className="flex gap-1">
                    <input type="text" value={item.periodStart} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodStart")} className="input input-sm validator w-full" />
                    <span className="text-xs text-center">~</span>
                    <input type="text" value={item.periodEnd} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodEnd")} className="input input-sm validator w-full" />
                  </div>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <input type="text" value={item.company} placeholder="근무처" onChange={handleChange(index, "company")} className="input input-sm w-full" />
                  <div className="flex gap-1 items-center">
                    <input type="text" value={item.description} placeholder="직무" onChange={handleChange(index, "description")} className="input input-sm flex-1" />
                    <span className="text-base-content/30 shrink-0">|</span>
                    <input type="text" value={item.role} placeholder="직급" onChange={handleChange(index, "role")} className="input input-sm flex-1" />
                  </div>
                  <input type="text" value={item.task1} placeholder="직무 설명" onChange={handleChange(index, "task1")} className="input input-sm w-full" />
                  <input type="text" value={item.task2} placeholder="직무 설명" onChange={handleChange(index, "task2")} className="input input-sm w-full" />
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return <div className="h-full w-full">{renderContentBySize()}</div>
}