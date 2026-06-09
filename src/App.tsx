import { DocumentProvider } from "./context/DocumentContext";
import NavBar from "./components/layouts/NavBar";
import { Outlet, useLocation } from "react-router";
import Footer from "./components/layouts/Footer";

/**
 * App (루트 레이아웃 컴포넌트)
 * - 모든 페이지를 DocumentProvider 로 감싸 문서 상태를 전역 공유
 * - 공통 NavBar 를 항상 렌더하고, 라우팅된 페이지는 <Outlet> 위치에 표시
 * - Footer 는 홈("/")에서만 노출
 */
export default function App () {
  const location = useLocation()
  const isHome = location.pathname === "/"   // 현재 경로가 홈인지 — NavBar/Footer 표시 분기에 사용
  return (
    <DocumentProvider>
      <NavBar isHome={isHome} />
      <Outlet />               {/* 자식 라우트(Home/Editor/Preview)가 렌더되는 자리 */}
      {isHome && <Footer />}
    </DocumentProvider>
  );
}