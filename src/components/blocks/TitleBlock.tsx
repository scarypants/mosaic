import { useDocument } from "../../context/DocumentContext"
import type { props } from "../../types/block"

export default function TitleBlock ({ block }: props) {
  const { updateBlockData } = useDocument()

  if (block.type !== "title") return null 
  const { text } = block.data

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlockData(block.id, { text: e.target.value })
  }
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