import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(false)

  const toggle = () => setExpanded(prev => !prev)

  return (
    <SidebarContext.Provider value={{ expanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
