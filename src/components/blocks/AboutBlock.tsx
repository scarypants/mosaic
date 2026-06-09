import { useDocument } from "../../context/DocumentContext"
import type { props } from "../../types/block"
import type { AboutBlockData } from "../../types/blockData"

/**
 * AboutBlock (자기소개 블록)
 * - 자유 서술형 자기소개 텍스트 영역. L 사이즈에서는 제목 입력칸이 추가된다.
 */
export default function AboutBlock ({ block }: props) {
  const { updateBlockData } = useDocument()

  if (block.type !== "about") return null   // 타입 가드
  const { title, content } = block.data

  // 필드명을 받아 해당 필드만 갱신하는 onChange 핸들러 생성 (커링)
  const handleChange = (field: keyof AboutBlockData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateBlockData(block.id, { [field]: e.target.value })
    }

  // 블록 크기별 레이아웃 (S/M: 내용만, L: 제목+내용)
  const renderContentBySize = () => {
    switch(block.size) { 
      case "S":
        return (
          <div className="flex flex-col p-4 h-full">
            <textarea value={content} placeholder="자기소개" onChange={handleChange("content")} className="flex-1 resize-none overflow-y-hidden"></textarea>
          </div>
        )
      case "M":
        return (
          <div className="flex flex-col p-4 h-full">
            <textarea value={content} placeholder="자기소개" onChange={handleChange("content")} className="flex-1 resize-none overflow-y-hidden"></textarea>
          </div>
        )
      case "L":
        return (
          <div className="flex flex-col p-4 h-full gap-2">
            <input type="text" value={title} placeholder="자기소개 제목" onChange={handleChange("title")} className="text-2xl" />
            <textarea value={content} placeholder="내용" onChange={handleChange("content")} className="flex-1 resize-none overflow-y-hidden"></textarea>
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return (
    <>
      <div className="flex flex-col h-full">{renderContentBySize()}</div>
    </>
  );
}