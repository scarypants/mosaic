import { useDocument } from "../../context/DocumentContext"
import type { props } from "../../types/block"
import type { AboutBlockData } from "../../types/blockData"

export default function AboutBlock ({ block }: props) {
  const { updateBlockData } = useDocument()
  
  if (block.type !== "about") return null 
  const { title, content } = block.data

  const handleChange = (field: keyof AboutBlockData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateBlockData(block.id, { [field]: e.target.value })
    }

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