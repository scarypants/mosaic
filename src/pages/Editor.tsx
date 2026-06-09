import { useEffect } from "react";
import { useLocation } from "react-router";
import DocumentRenderer from "../components/documents/DocumentRenderer";
import PropertyPanel from "../components/editors/PropertyPanel";
import Sidebar from "../components/editors/Sidebar";
import Toolbar from "../components/editors/Toolbar";
import { useDocument } from "../context/DocumentContext";
import type { TemplateName } from "../data/templates";

export default function Editor() {
  const { selectedBlockId, loadTemplate, loadFromStorage, clearBlocks } = useDocument()
  const location = useLocation()

  useEffect(() => {
    const state = location.state as { template?: TemplateName; fresh?: boolean; loadRecent?: boolean } | null
    if (!state) return  // preview에서 돌아온 경우 — 블록 유지
    if (state.loadRecent) {
      const loaded = loadFromStorage()
      if (!loaded) clearBlocks()  // 저장 데이터 없으면 빈 캔버스
    } else if (state.template) {
      loadTemplate(state.template)
    } else {
      clearBlocks()  // fresh: true 또는 custom
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 top-16 overflow-auto bg-base-200">

      <div className="fixed top-20 left-3 z-10">
        <Sidebar />
      </div>

      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10">
        <Toolbar />
      </div>

      {selectedBlockId &&
        <div className="fixed top-20 right-3 z-10">
          <PropertyPanel />
        </div>
      }

      <DocumentRenderer />
    </div>
  );
}
