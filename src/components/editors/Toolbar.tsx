import { useRef } from "react";
import { Trash, RefreshCcw, Eye, MoveLeft, ArrowDownToLine, FileOutput, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useDocument } from "../../context/DocumentContext";

/**
 * Toolbar (상단 작업 도구 모음)
 * - 현재 경로에 따라 다른 버튼 세트를 보여줌
 *   · /editor  : 삭제 / 가져오기 / 템플릿 변경 / 미리보기
 *   · /preview : 에디터로 돌아가기 / .mosaic 저장 / PDF 내보내기
 */
export default function Toolbar () {
  const { blocks, selectedBlockId, removeBlock, clearBlocks, importBlocks, setToastMsg } = useDocument()
  const navigate = useNavigate()
  const location = useLocation()   // 경로에 따라 표시할 버튼 결정
  const importInputRef = useRef<HTMLInputElement>(null)   // 숨겨진 파일 input 트리거용

  /** 선택된 블록 없이 삭제를 누른 경우의 안내 토스트 */
  const errorRemoveBlock = () => {
    setToastMsg("선택된 블록이 없습니다.")
    setTimeout(() => setToastMsg(null), 3000)
  }

  /**
   * 토스트 메시지를 띄우고 3초 후 자동으로 지우는 헬퍼
   * @param msg 표시할 안내 문구
   */
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  /**
   * PDF 내보내기 — 브라우저 인쇄(window.print) 기능을 활용한다.
   * - 인쇄 직전 확대/축소 transform 을 잠시 해제해 원본 크기로 출력되게 하고,
   *   인쇄가 끝나면(finally) 화면 표시를 원래대로 복구한다.
   */
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
      // 성공/실패와 관계없이 화면 표시를 원래대로 되돌림
      element.style.transform = prevTransform
      element.style.transformOrigin = prevOrigin
    }
  }

  /**
   * 현재 문서를 .mosaic 파일로 저장
   * - blocks 를 JSON(Blob)으로 만들어 다운로드시키고,
   *   생성한 ObjectURL 은 finally 에서 해제해 메모리 누수를 막는다.
   */
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

  /**
   * .mosaic 파일 가져오기 (에디터 내에서 현재 문서 교체)
   * - 확장자 검증 → JSON 파싱 → importBlocks(내부 구조 검증) 순으로 처리한다.
   * @param e 파일 input 의 change 이벤트
   */
  const handleImportMosaic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""   // 같은 파일 재선택 대응
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

  /**
   * 현재 경로(editor/preview)에 맞는 툴바 버튼 모음을 반환
   * - /editor: 삭제 / 가져오기 / 템플릿 변경 / 미리보기
   * - /preview: 에디터로 돌아가기 / .mosaic 저장 / PDF 내보내기
   */
  const renderContentByLocation = () => {
    // 편집 화면 툴바: 삭제 / 가져오기 / 템플릿 변경 / 미리보기
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
    // 미리보기 화면 툴바: 에디터로 돌아가기 / .mosaic 저장 / PDF 내보내기
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
