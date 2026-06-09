import { createContext, useContext } from "react"

const ReadOnlyContext = createContext(false)

export function ReadOnlyProvider({ children }: { children: React.ReactNode }) {
  return <ReadOnlyContext.Provider value={true}>{children}</ReadOnlyContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReadOnly = () => useContext(ReadOnlyContext)
