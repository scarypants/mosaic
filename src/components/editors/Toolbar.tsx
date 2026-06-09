import { useRef } from "react";
import { Trash, RefreshCcw, Eye, MoveLeft, ArrowDownToLine, FileOutput, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useDocument } from "../../context/DocumentContext";

export default function Toolbar () {
  const { blocks, selectedBlockId, removeBlock, clearBlocks, importBlocks, setToastMsg } = useDocument()
  const navigate = useNavigate()
  const location = useLocation()
  const importInputRef = useRef<HTMLInputElement>(null)

  const errorRemoveBlock = () => {
    setToastMsg("선택된 블록이 없습니다.")
    setTimeout(() => setToastMsg(null), 3000)
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleExportPDF = () => {
    const element = document.querySelector("[data-pdf-target]") as HTMLElement | null
    if (!element) {
      showToast("내보낼 문서를 찾을 수 없습니다.")
      return
    }
    const prevTransform = element.style.transform
    const prevOrigin = element.style.transformOrigin
    element.style.transform = "none"
    element.style.transformOrigin = "top left"
    try {
      window.print()
    } catch (err) {
      console.error("PDF 내보내기 실패:", err)
      showToast("PDF 내보내기에 실패했습니다.")
    } finally {
      element.style.transform = prevTransform
      element.style.transformOrigin = prevOrigin
    }
  }

  const handleSaveMosaic = () => {
    if (blocks.length === 0) {
      showToast("저장할 내용이 없습니다.")
      return
    }
    let url: string | null = null
    try {
      const json = JSON.stringify({ version: 1, blocks }, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "document.mosaic"
      a.click()
    } catch (err) {
      console.error(".mosaic 저장 실패:", err)
      showToast("파일 저장에 실패했습니다.")
    } finally {
      if (url) URL.revokeObjectURL(url)
    }
  }

  const handleImportMosaic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.name.endsWith(".mosaic")) {
      showToast(".mosaic 파일만 불러올 수 있습니다.")
      return
    }
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      importBlocks(data.blocks) // 내부에서 구조 검증 후 throw 가능
    } catch (err) {
      console.error(".mosaic 불러오기 실패:", err)
      showToast("잘못된 .mosaic 파일입니다.")
    }
  }

  const renderContentByLocation = () => {
    if (location.pathname === "/editor") {
      return(
        <ul className="menu menu-horizontal bg-base-300 rounded-box flex gap-16">
          <div className="flex gap-3">
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="삭제" className="flex" onClick={() => selectedBlockId ? removeBlock(selectedBlockId) : errorRemoveBlock()}>
                <Trash color="white" />
                <p className="text-neutral-content hidden xl:block">삭제</p>
              </button>
            </li>
          </div>
          <div className="flex gap-3">
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title=".mosaic 가져오기" className="flex" onClick={() => importInputRef.current?.click()}>
                <Upload color="white" />
                <p className="text-neutral-content hidden xl:block">가져오기</p>
              </button>
            </li>
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="템플릿 변경" className="flex" onClick={() => { clearBlocks(); navigate("/#templates") }}>
                <RefreshCcw color="white" />
                <p className="text-neutral-content hidden xl:block">템플릿 변경</p>
              </button>
            </li>
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="미리보기" className="flex" onClick={() => navigate("/preview")}>
                <Eye color="white" />
                <p className="text-neutral-content hidden xl:block">미리보기</p>
              </button>
            </li>
          </div>
          <input ref={importInputRef} type="file" accept=".mosaic" className="hidden" onChange={handleImportMosaic} />
        </ul>
      )
    } else if (location.pathname === "/preview") {
      return(
        <ul className="menu menu-horizontal bg-base-300 rounded-box flex gap-24 flex-nowrap">
          <div className="flex gap-3">
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="Editor로 돌아가기" className="flex" onClick={() => navigate("/editor")}>
                <MoveLeft color="white" />
                <p className="text-neutral-content hidden xl:block">Editor로 돌아가기</p>
              </button>
            </li>
          </div>
          <div className="flex gap-3">
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="파일로 저장" className="flex" onClick={handleSaveMosaic}>
                <ArrowDownToLine color="white" />
                <p className="text-neutral-content hidden xl:block">.mosaic 로 저장</p>
              </button>
            </li>
            <li className="bg-neutral rounded-box hover:bg-primary">
              <button title="PDF로 내보내기" className="flex" onClick={handleExportPDF}>
                <FileOutput color="white" />
                <p className="text-neutral-content hidden xl:block">PDF로 내보내기</p>
              </button>
            </li>
          </div>
        </ul>
      )
    }
  }

  return (
    <>
      <div>{renderContentByLocation()}</div>
    </>
  );
}
