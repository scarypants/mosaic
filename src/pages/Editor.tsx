import { useEffect } from "react";
import { useLocation } from "react-router";
import DocumentRenderer from "../components/documents/DocumentRenderer";
import PropertyPanel from "../components/editors/PropertyPanel";
import Sidebar from "../components/editors/Sidebar";
import Toolbar from "../components/editors/Toolbar";
import { useDocument } from "../context/DocumentContext";
import type { TemplateName } from "../data/templates";

/**
 * Editor 페이지 (문서 편집 화면)
 * - 좌측 Sidebar(블록 추가), 상단 Toolbar(저장/내보내기 등), 우측 PropertyPanel(속성 편집), 중앙 DocumentRenderer(편집 캔버스)로 구성
 * - 진입 시 navigate state 에 따라 템플릿/최근문서/빈 캔버스 중 무엇을 띄울지 결정
 */
export default function Editor() {
  const { selectedBlockId, loadTemplate, loadFromStorage, clearBlocks } = useDocument()
  const location = useLocation()  // Home 에서 넘어올 때 전달된 state(template/fresh/loadRecent) 확인

  // 진입 시 초기 문서 결정 (최초 1회만 실행 — deps [])
  useEffect(() => {
    const state = location.state as { template?: TemplateName; fresh?: boolean; loadRecent?: boolean } | null
    if (!state) return  // preview에서 돌아온 경우 — 블록 유지
    if (state.loadRecent) {
      // "Recent File" 진입: 로컬 저장본 로드, 없으면 빈 캔버스
      const loaded = loadFromStorage()
      if (!loaded) clearBlocks()  // 저장 데이터 없으면 빈 캔버스
    } else if (state.template) {
      // "Use Template" 진입: 선택한 템플릿 블록 구성 로드
      loadTemplate(state.template)
    } else {
      clearBlocks()  // fresh: true 또는 custom
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // 상단 NavBar(h-16) 아래를 가득 채우는 편집 영역
    <div className="fixed inset-0 top-16 overflow-auto bg-base-200">

      {/* 좌측 고정: 블록 추가 사이드바 */}
      <div className="fixed top-20 left-3 z-10">
        <Sidebar />
      </div>

      {/* 상단 중앙 고정: 저장·미리보기·내보내기 툴바 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10">
        <Toolbar />
      </div>

      {/* 우측 고정: 블록이 선택됐을 때만 표시되는 속성 편집 패널 */}
      {selectedBlockId &&
        <div className="fixed top-20 right-3 z-10">
          <PropertyPanel />
        </div>
      }

      {/* 중앙: 실제 문서(블록 그리드) 렌더링·편집 캔버스 */}
      <DocumentRenderer />
    </div>
  );
}
