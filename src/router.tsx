import { createBrowserRouter } from "react-router";

import App from "./App";

import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";
import { useEffect } from "react";

/**
 * HMR(개발 중 핫 리로드) 도중 라우트 상태가 깨졌을 때 보여주는 임시 화면.
 * 마운트되자마자 페이지를 새로고침해 정상 상태로 복구. (개발 편의용)
 */
function HMRErrorFallback() {
  useEffect(() => {
    window.location.reload()
  }, [])

  return(
    <div className="fixed inset-0 flex items-center justify-center bg-base-200">
      <div className="text-center">
        <p className="mb-4 text-base-content">HMR 리로드 중...</p>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,   // 공통 레이아웃(App) 아래에 자식 라우트 중첩

    children: [
      {
        index: true,        // "/" 기본 페이지
        element: <Home />,
      },

      {
        path: "editor",     // "/editor" — 문서 편집
        element: <Editor />,
        errorElement: <HMRErrorFallback />,
      },

      {
        path: "preview",    // "/preview" — 읽기 전용 미리보기
        element: <Preview />,
        errorElement: <HMRErrorFallback />,
      },
    ],
  },
], {
  // GitHub Pages 등 하위 경로 배포 대응 — vite base(/mosaic/)와 라우터 경로 일치 (개발 편의)
  basename: import.meta.env.BASE_URL,
});