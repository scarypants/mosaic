import { useDocument } from "../../context/DocumentContext";
import type { props } from "../../types/block";
import type { ProfileBlockData } from "../../types/blockData";


// 입력 검증용 정규식 — 영문 이름 / 전화번호 형식
const ENG_NAME_PATTERN = "[A-Za-z][A-Za-z .\\-]*"
const PHONE_PATTERN = "0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}"

const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 프로필 사진 최대 용량 3MB

/**
 * ProfileBlock (인적사항 블록)
 * - 이름/영문명/연락처/이메일/생년월일과 프로필 사진을 입력
 * - 사진은 파일을 base64(DataURL)로 변환해 블록 데이터에 저장 (별도 서버 없이 자체 보관)
 * - 사이즈 S/M/L 에 따라 표시 항목과 레이아웃이 달라짐
 */
export default function ProfileBlock ({ block }: props) {
  const { updateBlockData, setToastMsg } = useDocument()

  if (block.type !== "profile") return null   // 타입 가드
  const { name, englishName, imageUrl, email, phone, bid } = block.data

  /**
   * 필드명별로 "그 필드만 갱신하는 onChange 핸들러"를 만들어 반환 (커링)
   * @param field 갱신할 데이터 필드명 (name/englishName/email/phone/bid)
   */
  const handleChange = (field: keyof ProfileBlockData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBlockData(block.id, { [field]: e.target.value })
    }

  const today = new Date().toISOString().split("T")[0]   // 생년월일 max 값(미래 날짜 차단)

  /**
   * 토스트로 에러를 안내하고 3초 뒤 자동으로 지운다.
   * @param msg 표시할 에러 문구
   */
  const showError = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  /**
   * 프로필 사진 업로드 핸들러
   * - 이미지 타입·용량(3MB)을 검증한 뒤 FileReader 로 base64(DataURL)로 변환해 imageUrl 에 저장한다.
   * @param e 파일 input 의 change 이벤트
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""   // 같은 파일 재선택 시에도 onChange 발생하도록 초기화
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

  /** 블록 크기별 레이아웃 반환 (S: 핵심 3항목 / M: 사진+기본정보 / L: 표 형태 전체 항목) */
  const renderContentBySize = () => {
    switch(block.size) {
      case "S":
        return(
          <div className="h-full p-6 flex flex-col gap-3 justify-center">
            <input type="text" value={name} placeholder="이름" maxLength={20} className="input input-bordered w-full font-bold" onChange={handleChange("name")} />
            <input type="text" value={englishName} placeholder="영문 이름" pattern={ENG_NAME_PATTERN} title="영문만 입력하세요" maxLength={40} className="input input-bordered validator w-full" onChange={handleChange("englishName")} />
            <input type="tel" value={phone} placeholder="전화번호 (010-1234-5678)" pattern={PHONE_PATTERN} title="010-1234-5678 형식으로 입력하세요" className="input input-bordered validator w-full" onChange={handleChange("phone")} />
          </div>
        )
      case "M":
        return(
          <div className="h-full p-4 flex flex-row gap-3">

            <div className="flex flex-col justify-center items-center shrink-0">
              {imageUrl ? (
                <label htmlFor={`img-${block.id}`} className="group relative w-20 aspect-3/4 cursor-pointer">
                  <img src={imageUrl} alt="프로필 사진" className="w-full h-full object-cover rounded" />
                  <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">변경</span>
                </label>
              ) : (
                <label htmlFor={`img-${block.id}`} className="btn w-20 aspect-3/4 h-auto rounded">프로필 사진</label>
              )}
              <input type="file" accept="image/*" id={`img-${block.id}`} onChange={handleFileChange} hidden />
            </div>

            <div className="flex flex-col gap-3 w-full justify-center">
              <div className="flex gap-1">
                <input type="text" value={name} placeholder="이름" maxLength={20} className="input input-bordered w-[40%] font-bold" onChange={handleChange("name")} />
                <input type="text" value={englishName} placeholder="영문 이름" pattern={ENG_NAME_PATTERN} title="영문만 입력하세요" maxLength={40} className="input input-bordered validator w-[60%]" onChange={handleChange("englishName")} />
              </div>
              <input type="email" value={email} placeholder="이메일" title="올바른 이메일 형식으로 입력하세요" className="input input-bordered validator w-full" onChange={handleChange("email")} />
              <input type="tel" value={phone} placeholder="전화번호 (010-1234-5678)" pattern={PHONE_PATTERN} title="010-1234-5678 형식으로 입력하세요" className="input input-bordered validator w-full" onChange={handleChange("phone")} />
            </div>

          </div>
        )
      case "L":
        return (
          <div className="rounded-sm p-1 bg-base-100 h-full">
            <div className="grid grid-cols-12 h-full">

              <div className="col-span-2 flex flex-col items-center justify-center p-2 gap-2">
                {imageUrl ? (
                  <label htmlFor={`img-${block.id}`} className="group relative w-full aspect-3/4 cursor-pointer">
                    <img src={imageUrl} alt="프로필 사진" className="w-full h-full object-cover rounded" />
                    <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">변경</span>
                  </label>
                ) : (
                  <label htmlFor={`img-${block.id}`} className="btn w-full aspect-3/4 h-auto p-1 text-xs">프로필 사진</label>
                )}
                <input type="file" accept="image/*" id={`img-${block.id}`} onChange={handleFileChange} hidden />
              </div>

              <div className="col-span-10 grid grid-cols-2 text-sm items-center">

                <div className="px-2 py-1 flex items-center gap-1">
                  <label className="text-base-content/70 flex-none w-18 pl-1 font-medium">성명 (한글)</label>
                  <input type="text" value={name} placeholder="이름" className="input input-bordered w-full focus:input-primary" onChange={handleChange("name")} />
                </div>

                <div className="px-2 py-1 flex items-center gap-1">
                  <label className="text-base-content/70 flex-none w-14 pl-1 font-medium">(영문)</label>
                  <input type="text" value={englishName} placeholder="영문 이름" pattern={ENG_NAME_PATTERN} title="영문만 입력하세요" maxLength={40} className="input input-bordered validator w-full focus:input-primary" onChange={handleChange("englishName")} />
                </div>

                <div className="px-2 py-1 flex items-center gap-1">
                  <label className="text-base-content/70 flex-none w-18 pl-1 font-medium">이메일</label>
                  <input type="email" value={email} placeholder="이메일" title="올바른 이메일 형식으로 입력하세요" className="input input-bordered validator w-full focus:input-primary" onChange={handleChange("email")} />
                </div>

                <div className="px-2 py-1 flex items-center gap-1">
                  <label className="text-base-content/70 flex-none w-14 pl-1 font-medium">전화번호</label>
                  <input type="tel" value={phone} placeholder="전화번호 (010-1234-5678)" pattern={PHONE_PATTERN} title="010-1234-5678 형식으로 입력하세요" className="input input-bordered validator w-full focus:input-primary" onChange={handleChange("phone")} />
                </div>

                <div className="col-span-2 px-2 py-1 flex items-center gap-1">
                  <label className="text-base-content/70 flex-none w-18 pl-1 font-medium">생년월일</label>
                  <input type="date" value={bid} max={today} title="미래 날짜는 선택할 수 없습니다" className="input input-bordered validator w-full focus:input-primary" onChange={handleChange("bid")} />
                </div>

              </div>

            </div>
          </div>
        )
      default:
        return <div>알 수 없는 사이즈</div>
    }
  }
  return <div className="h-full w-full">{renderContentBySize()}</div>;
}