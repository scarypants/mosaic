import { Sparkles, LayoutGrid, Download, File, Clock, FileUp, User, Briefcase, Columns3Cog } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import type { TemplateName } from "../data/templates";
import { useDocument } from "../context/DocumentContext";

/**
 * Home 페이지 (랜딩 페이지)
 * - Hero / Why MOSAIC / Get Started / Templates 네 개의 풀스크린 섹션으로 구성
 * - 새 문서 시작, 최근 문서 이어쓰기, .mosaic 파일 가져오기, 템플릿 선택 진입점 제공
 * - scroll-snap 으로 섹션 단위 스크롤 UX 제공
 */
export default function Home () {
  const navigate = useNavigate()              // 프로그래밍 방식 페이지 이동
  const location = useLocation()              // 현재 경로/해시(#about 등) 확인용
  const { importBlocks, hasSavedData, setToastMsg } = useDocument()  // 전역 문서 상태
  const hasSaved = hasSavedData()             // 저장된 최근 문서 존재 여부 (Recent File 활성화 판단)

  const heroRef = useRef<HTMLElement>(null)           // Hero 섹션 DOM 참조 (휠 스크롤 영역 판정)
  const imageContainerRef = useRef<HTMLDivElement>(null)  // Hero 이미지 스크롤 컨테이너 참조

  // [기능] scroll-snap 활성화
  // 홈에 들어올 때만 body 에 snap-home 클래스를 붙여 섹션 단위 스크롤을 켜고,
  // 페이지를 떠날 때(cleanup) 다시 제거해 다른 페이지에 영향을 주지 않음
  useEffect(() => {
    document.body.classList.add("snap-home")
    return () => document.body.classList.remove("snap-home")
  }, [])

  // [기능] Hero 이미지 우선 스크롤
  // Hero 의 긴 이력서 이미지를 먼저 끝까지 스크롤한 뒤에야 다음 섹션으로 넘어가도록 휠 이벤트를 가로챔
  useEffect(() => {
    const container = imageContainerRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      const hero = heroRef.current
      if (!hero) return
      // Hero 섹션이 화면 밖이면 기본 스크롤 동작에 맡김
      const heroRect = hero.getBoundingClientRect()
      if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return

      // 이미지 컨테이너가 위/아래 끝에 닿았는지 판정 (오차 2px 허용)
      const { scrollTop, scrollHeight, clientHeight } = container
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2
      const atTop = scrollTop <= 2

      // 아직 더 스크롤할 여지가 있으면 페이지 스크롤을 막고 이미지 내부만 스크롤
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
        e.preventDefault()
        container.scrollTop += e.deltaY
      }
    }

    // passive:false 여야 preventDefault 로 페이지 스크롤을 막을 수 있음
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [])

  // [기능] .mosaic 파일 가져오기
  // 파일 선택 → 확장자 검증 → JSON 파싱 → 블록 검증/주입 → 에디터로 이동
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""  // 같은 파일을 다시 선택해도 onChange 가 발생하도록 초기화
    if (!file) return
    // 확장자 검증 — .mosaic 이 아니면 토스트로 안내 후 중단
    if (!file.name.endsWith(".mosaic")) {
      setToastMsg(".mosaic 파일만 불러올 수 있습니다.")
      setTimeout(() => setToastMsg(null), 3000)
      return
    }
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      importBlocks(data.blocks) // 내부에서 구조 검증 후 throw 가능
      navigate("/editor")
    } catch (err) {
      // 파싱 실패나 구조 검증 실패 시 사용자에게 토스트로 안내
      console.error(".mosaic 불러오기 실패:", err)
      setToastMsg("잘못된 .mosaic 파일입니다.")
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  // [기능] 해시(#about, #start, #templates) 스크롤 이동
  // NavBar 링크로 들어온 해시를 감지해 해당 섹션으로 부드럽게 스크롤한 뒤,
  // 주소창에서 해시를 제거(replace)해 새로고침/뒤로가기 시 다시 점프하지 않게 함
  useEffect(() => {
    if (!location.hash) return
    const element = document.querySelector(location.hash)
    if (!element) return
    element.scrollIntoView({ behavior: "smooth" })
    navigate(location.pathname, { replace: true })
  // navigate는 React Router가 안정적 참조를 보장하므로 deps 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  // "Why MOSAIC?" 섹션의 소개 카드 3종 데이터
  const aboutList = [
    {title: "Designed for Identity", caption: "누구나 같은 이력서가 아닌자신만의 스타일을 표현할 수 있습니다.", icon: <Sparkles />},
    {title: "Modular Sections", caption: "블록을 추가하고 조정하며원하는 구조를 직접 만들어갑니다.", icon: <LayoutGrid />},
    {title: "Export & Share", caption: "PDF와 .mosaic 파일로 내보내도 언제든 다시 불러와 이어서 편집할 수 있습니다.", icon: <FileUp />},
  ]

  // "Templates" 섹션의 템플릿 카드 데이터 (key=null 은 빈 캔버스 Custom)
  const templateList: { title: string; icon: React.ReactNode; key: TemplateName | null }[] = [
    { title: "Resume",    icon: <User size={80} />,         key: "resume" },
    { title: "Portfolio", icon: <Briefcase size={80} />,    key: "portfolio" },
    { title: "Custom",    icon: <Columns3Cog size={80} />,  key: null },
  ]

  // [기능] 템플릿 선택 → 에디터로 이동하면서 어떤 템플릿을 적용할지 state 로 전달
  const handleUseTemplate = (key: TemplateName | null) => {
    navigate("/editor", { state: { template: key } })
  }

  return (
    <>
      <main className="flex flex-col">

        {/* ── Hero ── */}
        <section ref={heroRef} style={{ scrollSnapAlign: "start" }} className="h-screen hero bg-base-100">
          <div className="hero-content pt-16 flex-col lg:flex-row-reverse gap-16">
            <div className="relative">
              <div ref={imageContainerRef} className="h-[65vh] w-[45vw] min-w-72 overflow-y-scroll rounded-2xl no-scrollbar shadow-2xl">
                <img src={`${import.meta.env.BASE_URL}imgs/resume.png`} alt="resume" className="w-full h-auto" />
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl bg-linear-to-t from-base-100/80 to-transparent" />
            </div>
            <div className="max-w-lg">
              <h1 className="text-6xl font-bold leading-tight">Build your story.</h1>
              <p className="py-6 text-lg text-base-content/70">조각들을 모아, 당신만의 문서를.</p>
              <a href="#start" className="btn btn-primary btn-lg">Get Started!</a>
            </div>
          </div>
        </section>

        {/* ── Why MOSAIC ── */}
        <section id="about" style={{ scrollSnapAlign: "start" }} className="h-screen bg-neutral text-neutral-content flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl px-10">
            <h1 className="text-5xl font-bold text-center mb-4">Why MOSAIC?</h1>
            <p className="text-center text-neutral-content/70 mb-14">자유로운 블록 편집으로 완성하는 나만의 문서</p>
            <div className="flex justify-center gap-8">
              {aboutList.map((item) => (
                <div key={item.title} className="bg-base-100 text-base-content rounded-2xl p-8 flex flex-col items-center text-center gap-5 w-72 shadow-lg">
                  <div className="text-primary bg-primary/10 rounded-full p-4">
                    {item.icon}
                  </div>
                  <h2 className="font-bold text-xl">{item.title}</h2>
                  <p className="text-base-content/60 text-sm leading-relaxed">{item.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Get Started ── */}
        <section id="start" style={{ scrollSnapAlign: "start" }} className="h-screen flex items-center justify-center">
          <div className="w-[90%] max-w-5xl h-[70vh] grid grid-cols-2 grid-rows-5 gap-4">
            <div className="col-start-1 row-start-1 row-span-2 items-end flex">
              <h1 className="text-5xl font-bold p-5 mt-auto">Get Started</h1>
            </div>
            {/* New Document — fresh 플래그로 빈 캔버스를 열도록 에디터에 진입 */}
            <div className="hover:bg-accent hover:text-accent-content col-start-1 row-start-3 row-span-3 bg-base-100">
              <Link to="/editor" state={{ fresh: true }} className="flex h-full w-full items-center p-8">
                <File size={56} className="m-3" />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-left">New Document</h2>
                  <p>빈 캔버스에서 새로운 문서를 시작합니다.</p>
                </div>
              </Link>
            </div>
            {/* Recent File — 저장된 문서가 있을 때만 클릭 가능(loadRecent), 없으면 흐리게 비활성화 */}
            <div className={`col-start-2 row-start-2 row-span-2 ${hasSaved ? "hover:bg-accent hover:text-accent-content bg-base-100 cursor-pointer" : "bg-base-100 opacity-40 cursor-not-allowed"}`}>
              {hasSaved ? (
                <button onClick={() => navigate("/editor", { state: { loadRecent: true } })} className="flex h-full w-full items-center p-8">
                  <Clock size={56} className="m-3" />
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-left">Recent File</h2>
                    <p>최근 작업한 문서를 이어서 편집합니다.</p>
                  </div>
                </button>
              ) : (
                <div className="flex h-full w-full items-center p-8">
                  <Clock size={56} className="m-3" />
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-left">Recent File</h2>
                    <p>저장된 파일이 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
            {/* Import .mosaic — 숨겨진 file input 을 label 로 트리거 → handleImportFile 처리 */}
            <div className="hover:bg-accent hover:text-accent-content row-span-2 bg-base-100">
              <label htmlFor="file" className="flex h-full w-full items-center p-8 cursor-pointer">
                <Download size={56} className="m-3" />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-left">Import .mosaic File</h2>
                  <p>저장된 MOSAIC 파일을 불러옵니다.</p>
                </div>
              </label>
              <input id="file" type="file" accept=".mosaic" className="hidden" onChange={handleImportFile} />
            </div>
          </div>
        </section>

        {/* ── Templates ── */}
        <section id="templates" style={{ scrollSnapAlign: "start" }} className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold mb-12">Templates</h1>
          <div className="flex gap-8">
            {templateList.map((template) => (
              <div key={template.title} className="card bg-base-100 w-72 shadow-md h-80 justify-center items-center hover:shadow-2xl transition-shadow">
                <h2 className="card-title text-2xl pt-6">{template.title}</h2>
                <figure className="p-10">
                  {template.icon}
                </figure>
                <div className="card-actions justify-center pb-6">
                  <button className="btn btn-primary" onClick={() => handleUseTemplate(template.key)}>
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
