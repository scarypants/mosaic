import { useDocument } from "../../context/DocumentContext"
import type { props } from "../../types/block"

/**
 * TitleBlock (제목 블록)
 * - 문서의 큰 제목을 입력하는 블록. 기본 정렬이 가운데(text-center)이다.
 * - 사이즈(S/M/L)에 따라 글자 크기만 달라지고 입력 동작은 동일
 */
export default function TitleBlock ({ block }: props) {
  const { updateBlockData } = useDocument()

  if (block.type !== "title") return null   // 타입 가드 — title 블록일 때만 렌더
  const { text } = block.data

  /** 제목 입력값을 전역 문서 상태에 반영 (제어 컴포넌트) */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlockData(block.id, { text: e.target.value })
  }

  /** 블록 크기(S/M/L)에 따라 글자 크기만 다른 입력 UI 를 반환 */
  const renderContentBySize = () => {
    switch (block.size) {
      case "S":
        return (
          <div className="text-4xl flex justify-center items-center">
            <input type="text" value={text} placeholder="제목" className="w-full text-center h-46 m-auto" onChange={handleChange} />
          </div>
        )
      case "M":
        return (
          <div className="text-5xl flex justify-center items-center">
            <input type="text" value={text} placeholder="제목" className="w-full text-center h-46 m-auto" onChange={handleChange} />
          </div>
        )
      case "L":
        return (
          <div className="text-6xl flex justify-center items-center">
            <input type="text" value={text} placeholder="제목" className="w-full text-center h-46 m-auto" onChange={handleChange} />
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return (
    <>
      <div>{renderContentBySize()}</div>
    </>
  );
}