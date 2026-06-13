import { Link, useLocation } from "react-router";

/**
 * NavBar (상단 고정 내비게이션 바)
 * - 모든 페이지 상단에 항상 표시되는 로고 + (홈에서만) 섹션 이동 메뉴
 */
export default function NavBar () {
  const location = useLocation()
  const isHome = location.pathname === "/"

  /**
   * 로고 클릭 동작
   * - 이미 홈("/")에 있으면 페이지 이동 대신 맨 위로 부드럽게 스크롤하고,
   *   다른 페이지면 기본 동작(Link)으로 홈으로 이동한다.
   */
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      <main className="navbar shadow-sm bg-base-100 fixed w-full h-16 min-h-16 z-50">
        {/* 로고 */}
        <div className="flex-1">
          <Link to="/" onClick={handleLogoClick} className="btn btn-ghost text-xl">
            <img src={`${import.meta.env.BASE_URL}imgs/logo.png`} alt="logo" className="w-8" />
            <h2>MOSAIC</h2>
          </Link>
        </div>

        {/* 홈에서만 노출되는 섹션 이동 메뉴 */}
        {isHome &&
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li><a href={`${import.meta.env.BASE_URL}#templates`}>TEMPLATE</a></li>
              <li><a href={`${import.meta.env.BASE_URL}#about`}>ABOUT</a></li>
              <li><a href={`${import.meta.env.BASE_URL}#start`}>START</a></li>
            </ul>
          </div>}
      </main>
    </>
  );
}