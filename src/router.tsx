import { createBrowserRouter } from "react-router";

import App from "./App";

import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";
import { useEffect } from "react";

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
    element: <App />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "editor",
        element: <Editor />,
        errorElement: <HMRErrorFallback />,
      },

      {
        path: "preview",
        element: <Preview />,
        errorElement: <HMRErrorFallback />,
      },
    ],
  },
]);