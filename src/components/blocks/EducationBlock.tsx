import { useDocument } from "../../context/DocumentContext"
import { useReadOnly } from "../../context/ReadOnlyContext"
import type { props } from "../../types/block"
import type { EducationBlockData } from "../../types/blockData"

// 기간 입력 형식 검증 (YYYY.MM.)
const PERIOD_PATTERN = "[0-9]{4}\\.[0-9]{2}\\.?"
const PERIOD_TITLE = "YYYY.MM. 형식으로 입력하세요 (예: 2020.03.)"

/**
 * EducationBlock (학력 블록)
 * - 여러 학력 항목(items 배열)을 입력. 졸업여부는 select(재학/휴학/졸업)
 * - M 사이즈: 간단 목록, L 사이즈: 기간/학교/학과/졸업여부 4열 표
 * - 읽기 전용에서는 select 대신 텍스트로 졸업여부를 표시
 */
export default function EducationBlock({ block }: props) {
  const { updateBlockData } = useDocument()
  const isReadOnly = useReadOnly()

  if (block.type !== "education") return null   // 타입 가드
  const { items } = block.data

  // [기능] 특정 항목(index)의 특정 필드(field)만 불변 갱신
  const handleChange = (index: number, field: keyof EducationBlockData["items"][number]) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, [field]: e.target.value } : item
      );
      updateBlockData(block.id, { items: newItems });
    };

  // 블록 크기별 레이아웃 반환 (M: 간단 / L: 표)
  const renderContentBySize = () => {
    switch (block.size) {
      case "M":
        return (
          <div className="p-4 flex flex-col gap-2">
            <p className="font-bold text-sm mb-2">학력</p>
            {items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex flex-col gap-1 pt-1">
                <div className="flex gap-1 items-center">
                  <input type="text" value={item.periodStart} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodStart")} className="input input-xs validator w-[30%]" />
                  <span>~</span>
                  <input type="text" value={item.periodEnd} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodEnd")} className="input input-xs validator w-[30%]" />
                </div>
                <div className="flex gap-1">
                  <input type="text" value={item.school} placeholder="학교명" onChange={handleChange(index, "school")} className="input input-xs flex-1" />
                  <input type="text" value={item.major} placeholder="전공명" onChange={handleChange(index, "major")} className="input input-xs flex-1" />
                  <select value={item.graduated} onChange={handleChange(index, "graduated")} className="select select-xs w-[25%]">
                    <option value="" disabled>졸업여부</option>
                    <option value="재학">재학</option>
                    <option value="휴학">휴학</option>
                    <option value="졸업">졸업</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      case "L":
        return (
          <div className="flex h-full">
            <div className="flex items-center justify-center w-14 border-r border-base-300 shrink-0">
              <span className="text-sm font-medium">학력</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="grid grid-cols-4 border-b border-base-300 bg-base-200/50 shrink-0 divide-x divide-base-300">
                <p className="text-xs font-medium text-center py-2">기간</p>
                <p className="text-xs font-medium text-center py-2">학교명</p>
                <p className="text-xs font-medium text-center py-2">학과명</p>
                <p className="text-xs font-medium text-center py-2">졸업여부</p>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 border-t border-base-200 flex-1 items-stretch divide-x divide-base-200">
                  <div className="flex items-center gap-1 p-1">
                    <input type="text" value={item.periodStart} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodStart")} className="field-validate w-full text-sm focus:outline-none min-w-0" />
                    {!(isReadOnly && !item.periodStart && !item.periodEnd) && <span className="text-xs shrink-0">~</span>}
                    <input type="text" value={item.periodEnd} placeholder="0000.00." pattern={PERIOD_PATTERN} title={PERIOD_TITLE} onChange={handleChange(index, "periodEnd")} className="field-validate w-full text-sm focus:outline-none min-w-0" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.school} placeholder="학교명" onChange={handleChange(index, "school")} className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.major} placeholder="전공명" onChange={handleChange(index, "major")} className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    {isReadOnly ? (
                      <span className="w-full text-sm">{item.graduated}</span>
                    ) : (
                      <select value={item.graduated} onChange={handleChange(index, "graduated")} className="w-full text-sm focus:outline-none bg-transparent">
                        <option value="" disabled>졸업여부</option>
                        <option value="재학">재학</option>
                        <option value="휴학">휴학</option>
                        <option value="졸업">졸업</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return <div className="h-full w-full">{renderContentBySize()}</div>
}