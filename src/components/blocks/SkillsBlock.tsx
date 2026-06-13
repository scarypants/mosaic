import { useDocument } from "../../context/DocumentContext";
import type { props } from "../../types/block";
import type { SkillBlockData } from "../../types/blockData";

// 취득일 입력 형식 검증 — S(연도 4자리) / L(YYYY.MM.DD)
const YEAR_PATTERN = "[0-9]{4}"
const DATE_PATTERN = "[0-9]{4}\\.[0-9]{2}\\.[0-9]{2}"

/**
 * SkillsBlock (자격증 블록)
 * - 여러 자격증 항목(items 배열)을 입력
 * - S 사이즈: 취득년도+이름만, L 사이즈: 취득일자/면허명/등급/시험처 4열 표
 */
export default function SkillsBlock({ block }: props) {
  const { updateBlockData } = useDocument()

  if (block.type !== "skill") return null   // 타입 가드
  const { items } = block.data

  /**
   * 자격증 목록(items) 중 특정 항목의 특정 필드만 불변 방식으로 갱신하는 핸들러를 만들어 반환
   * @param index 갱신할 항목의 인덱스
   * @param field 갱신할 필드명 (date/name/level/organization)
   */
  const handleChange = (index: number, field: keyof SkillBlockData["items"][number]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, [field]: e.target.value } : item
      );
      updateBlockData(block.id, { items: newItems });
    };

  /** 블록 크기별 레이아웃 반환 (S: 취득년도+이름 / L: 취득일자·면허명·등급·시험처 4열 표) */
  const renderContentBySize = () => {
    switch (block.size) {
      case "S":
        return (
          <div className="p-4 flex flex-col gap-2">
            <p className="font-bold text-sm mb-1">자격증</p>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="text" value={item.date} placeholder="취득년도" pattern={YEAR_PATTERN} title="연도 4자리를 입력하세요 (예: 2024)" onChange={handleChange(index, "date")} className="input input-sm validator w-18" />
                <input type="text" value={item.name} placeholder="자격증 이름" onChange={handleChange(index, "name")} className="input input-sm flex-1" />
              </div>
            ))}
          </div>
        )
      case "L":
        return (
          <div className="flex h-full">
            <div className="flex items-center justify-center w-14 border-r border-base-300 shrink-0">
              <span className="text-sm font-medium">자격증</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="grid grid-cols-4 border-b border-base-300 bg-base-200/50 shrink-0 divide-x divide-base-300">
                <p className="text-xs font-medium text-center py-2">취득일자</p>
                <p className="text-xs font-medium text-center py-2">자격증 및 면허명</p>
                <p className="text-xs font-medium text-center py-2">등급</p>
                <p className="text-xs font-medium text-center py-2">시험처</p>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 border-t border-base-200 flex-1 items-stretch divide-x divide-base-200">
                  <div className="flex items-center p-1">
                    <input type="text" value={item.date} placeholder="0000.00.00" pattern={DATE_PATTERN} title="YYYY.MM.DD 형식으로 입력하세요 (예: 2024.03.15)" onChange={handleChange(index, "date")} className="field-validate w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.name} placeholder="자격증명" onChange={handleChange(index, "name")} className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.level} placeholder="등급" onChange={handleChange(index, "level")} className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center p-1">
                    <input type="text" value={item.organization} placeholder="시험처" onChange={handleChange(index, "organization")} className="w-full text-sm focus:outline-none" />
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