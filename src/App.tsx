import { DocumentProvider } from "./context/DocumentContext";
import NavBar from "./components/layouts/NavBar";
import { Outlet } from "react-router";

/**
 * App (루트 레이아웃 컴포넌트)
 * - 모든 페이지를 DocumentProvider 로 감싸 문서 상태를 전역 공유
 * - 공통 NavBar 를 항상 렌더링하고, 라우팅된 페이지는 <Outlet> 위치에 표시
 */
export default function App () {
  return (
    <DocumentProvider>
      <NavBar />
      {/* 라우팅 페이지 표시 */}
      <Outlet />
    </DocumentProvider>
  );
}