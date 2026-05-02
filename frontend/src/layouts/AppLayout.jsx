import { Outlet } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import './AppLayout.css'

export default function AppLayout() {
  const { expanded } = useSidebar()

  return (
    <div className="app-layout">

      {/* Imagem de fundo */}
      <img
        className="app-bg"
        src="/assets/Background-Site.png"
        alt=""
        aria-hidden="true"
      />

      {/* Sidebar — escrita UMA única vez */}
      <Sidebar />

      {/* Navbar — escrita UMA única vez */}
      <Navbar />

      {/* Conteúdo da página activa */}
      <main className={`app-main ${expanded ? 'expandido' : ''}`}>
        <Outlet />
      </main>

    </div>
  )
}
