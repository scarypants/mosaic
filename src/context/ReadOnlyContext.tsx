// 읽기 전용 모드 컨텍스트
// - 같은 블록 컴포넌트를 편집(에디터)/미리보기(읽기 전용) 양쪽에서 재사용하기 위한 플래그
// - 기본값 false(편집 가능). Preview 페이지에서만 Provider 로 true 를 주입한다.
import { createContext, useContext } from "react"

const ReadOnlyContext = createContext(false)

// 하위 트리를 읽기 전용으로 표시 (Preview 에서 사용)
export function ReadOnlyProvider({ children }: { children: React.ReactNode }) {
  return <ReadOnlyContext.Provider value={true}>{children}</ReadOnlyContext.Provider>
}

// 현재 읽기 전용 여부를 구독하는 훅 — 블록들이 입력 비활성화/드래그 차단 등에 사용
// eslint-disable-next-line react-refresh/only-export-components
export const useReadOnly = () => useContext(ReadOnlyContext)
