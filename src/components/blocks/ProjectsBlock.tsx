import { useDocument } from "../../context/DocumentContext"
import type { props } from "../../types/block"
import type { ProjectBlockData } from "../../types/blockData"

const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 프로젝트 이미지 최대 용량 3MB

/**
 * ProjectsBlock (프로젝트 블록)
 * - 프로젝트 이름/소개/역할/링크와 대표 이미지를 입력
 * - ProfileBlock 과 동일하게 이미지를 base64 로 변환해 보관
 * - 사이즈 S/M/L 에 따라 이미지 유무와 입력 항목이 달라짐
 */
export default function ProjectsBlock({ block }: props) {
  const { updateBlockData, setToastMsg } = useDocument()

  if (block.type !== "project") return null   // 타입 가드
  const { imageUrl, title, description, role, link } = block.data

  /**
   * 필드명별로 "그 필드만 갱신하는 onChange 핸들러"를 만들어 반환 (커링)
   * @param field 갱신할 데이터 필드명 (title/description/role/link)
   */
  const handleChange = (field: keyof ProjectBlockData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateBlockData(block.id, { [field]: e.target.value })
    }

  /**
   * 토스트로 에러를 안내하고 3초 뒤 자동으로 지운다.
   * @param msg 표시할 에러 문구
   */
  const showError = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  /**
   * 프로젝트 대표 이미지 업로드 핸들러
   * - 이미지 타입·용량(3MB)을 검증한 뒤 FileReader 로 base64(DataURL)로 변환해 imageUrl 에 저장한다.
   * @param e 파일 input 의 change 이벤트
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""   // 같은 파일 재선택 대응
    if (!file) return
    if (!file.type.startsWith("image/")) {
      showError("이미지 파일만 업로드할 수 있습니다.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showError("이미지 용량은 3MB 이하만 가능합니다.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateBlockData(block.id, { imageUrl: reader.result as string })
    reader.onerror = () => showError("이미지를 불러오지 못했습니다.")
    reader.readAsDataURL(file)
  }

  /** 블록 크기별 레이아웃 반환 (S: 이미지 없는 입력 / M·L: 대표 이미지 + 입력 항목) */
  const renderContentBySize = () => {
    switch (block.size) {
      case "S":
        return (
          <div className="p-4 flex flex-col gap-2">
            <input type="text" value={title} placeholder="프로젝트 이름" onChange={handleChange("title")} className="input input-sm w-full font-medium" />
            <input type="text" value={description} placeholder="간단한 소개" onChange={handleChange("description")} className="input input-sm w-full" />
            <input type="text" value={role} placeholder="역할" onChange={handleChange("role")} className="input input-sm w-full" />
            <input type="url" value={link} placeholder="링크 (https://...)" title="https:// 로 시작하는 올바른 URL을 입력하세요" onChange={handleChange("link")} className="input input-sm validator w-full" />
          </div>
        )
      case "M":
        return (
          <div className="h-full p-4 flex gap-3">
            <div className="flex flex-col justify-center items-center self-stretch w-32 shrink-0">
              {imageUrl ? (
                <label htmlFor={`img-${block.id}`} className="group relative h-full w-full cursor-pointer">
                  <img src={imageUrl} alt="프로젝트 사진" className="w-full h-full object-cover rounded" />
                  <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">변경</span>
                </label>
              ) : (
                <label htmlFor={`img-${block.id}`} className="btn h-full w-full">프로젝트 사진 추가</label>
              )}
              <input type="file" accept="image/*" id={`img-${block.id}`} onChange={handleFileChange} hidden />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <input type="text" value={title} placeholder="프로젝트 이름" onChange={handleChange("title")} className="input input-sm w-full font-medium" />
              <textarea value={description} placeholder="간단한 소개" onChange={handleChange("description")} className="textarea textarea-sm w-full flex-1 resize-none" />
              <input type="url" value={link} placeholder="링크 (https://...)" title="https:// 로 시작하는 올바른 URL을 입력하세요" onChange={handleChange("link")} className="input input-xs validator w-full" />
            </div>
          </div>
        )
      case "L":
        return (
          <div className="h-full p-4 flex gap-4">
            <div className="flex flex-col justify-center items-center self-stretch w-44 shrink-0">
              {imageUrl ? (
                <label htmlFor={`img-${block.id}`} className="group relative h-full w-full cursor-pointer">
                  <img src={imageUrl} alt="프로젝트 사진" className="w-full h-full object-cover rounded" />
                  <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">변경</span>
                </label>
              ) : (
                <label htmlFor={`img-${block.id}`} className="btn h-full w-full">프로젝트 사진 추가</label>
              )}
              <input type="file" accept="image/*" id={`img-${block.id}`} onChange={handleFileChange} hidden />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex gap-2">
                <input type="text" value={title} placeholder="프로젝트 이름" onChange={handleChange("title")} className="input input-sm flex-1 font-medium" />
                <input type="text" value={role} placeholder="역할" onChange={handleChange("role")} className="input input-sm flex-1" />
              </div>
              <textarea value={description} placeholder="소개" onChange={handleChange("description")} className="textarea textarea-sm w-full flex-1 resize-none" />
              <input type="url" value={link} placeholder="링크 (https://...)" title="https:// 로 시작하는 올바른 URL을 입력하세요" onChange={handleChange("link")} className="input input-xs validator w-full" />
            </div>
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return <div className="h-full w-full">{renderContentBySize()}</div>
}
