import Toolbar from "../components/editors/Toolbar";
import DocumentRenderer from "../components/documents/DocumentRenderer";
import { ReadOnlyProvider } from "../context/ReadOnlyContext";

export default function Preview() {
  return (
    <ReadOnlyProvider>
      <div className="min-h-screen bg-base-200 pt-16">
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10">
          <Toolbar />
        </div>

        <DocumentRenderer />
      </div>
    </ReadOnlyProvider>
  );
}