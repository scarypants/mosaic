// 앱 진입점(entry point)
// - 전역 스타일을 불러오고, 라우터를 React 트리에 연결해 #root 에 마운트
import { createRoot } from 'react-dom/client'
import './styles/index.css'   // Tailwind/daisyUI 등 기본 스타일
import './styles/styles.css'  // 프로젝트 커스텀 스타일(블록 정렬 클래스 등)
import { router } from './router.tsx'
import { RouterProvider } from 'react-router'

// index.html 의 <div id="root"> 에 라우터 기반 앱을 렌더링
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
