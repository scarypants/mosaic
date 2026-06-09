import Toolbar from "../components/editors/Toolbar";
import DocumentRenderer from "../components/documents/DocumentRenderer";
import { ReadOnlyProvider } from "../context/ReadOnlyContext";

/**
 * Preview 페이지 (미리보기/읽기 전용 화면)
 * - 에디터와 같은 DocumentRenderer 를 쓰되 ReadOnlyProvider 로 감싸 편집·드래그를 비활성화
 * - PDF 내보내기 전 최종 레이아웃을 확인하는 용도
 */
export default function Preview() {
  return (
    // ReadOnlyProvider: 하위 블록들이 읽기 전용 모드로 렌더되도록 컨텍스트 제공
    <ReadOnlyProvider>
      <div className="min-h-screen bg-base-200 pt-16">
        {/* 상단 중앙 고정: 에디터로 돌아가기·PDF 내보내기 등 툴바 */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10">
          <Toolbar />
        </div>

        {/* 읽기 전용 문서 렌더링 */}
        <DocumentRenderer />
      </div>
    </ReadOnlyProvider>
  );
}