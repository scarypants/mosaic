import { Link, useLocation } from "react-router";

export default function NavBar ({isHome}: {isHome: boolean}) {
  const location = useLocation()

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      <main className="navbar shadow-sm bg-base-100 fixed w-full h-16 min-h-16 z-50">
        <div className="flex-1">
          <Link to="/" onClick={handleLogoClick} className="btn btn-ghost text-xl">
            <img src={`${import.meta.env.BASE_URL}imgs/logo.png`} alt="logo" className="w-8" />
            <h2>MOSAIC</h2>
          </Link>
        </div>

        {isHome &&
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li><a href="/#templates">TEMPLATE</a></li>
              <li><a href="/#about">ABOUT</a></li>
              <li><a href="/#start">START</a></li>
            </ul>
          </div>}
      </main>
    </>
  );
}