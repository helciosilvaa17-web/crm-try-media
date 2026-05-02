import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar({ onNovoCLiente }) {
  const { expanded } = useSidebar()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={`navbar ${expanded ? 'expandido' : ''}`}>
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-logo">
          <img src="/assets/Logo TRY MEDIA.png" alt="TRY MEDIA" />
        </div>

        {/* Acções da direita */}
        <div className="navbar-actions">

          {/* Pesquisa */}
          <div className="navbar-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Botão novo cliente */}
          <button className="btn-novo-cliente" onClick={onNovoCLiente}>
            + Novo Cliente
          </button>

          {/* User dropdown */}
          <div className="navbar-user" onClick={() => setMenuOpen(o => !o)}>
            <i className="bi bi-person-circle"></i>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user?.nome}</span>
                  <span className="user-role">{user?.perfil}</span>
                </div>
                <hr />
                <button onClick={() => navigate('/perfil')}>
                  <i className="bi bi-person"></i> Perfil
                </button>
                <button onClick={handleLogout} className="btn-logout">
                  <i className="bi bi-box-arrow-right"></i> Sair
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
