import { NavLink, useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

export default function Sidebar() {
  const { expanded, toggle } = useSidebar()
  const { isAdmin, utilizador, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
<<<<<<< Updated upstream
    { to: '/pipeline',      icon: 'bi-funnel-fill',          label: 'Leads'          },
    { to: '/clientes',      icon: 'bi-people-fill',          label: 'Clientes'       },
    { to: '/dashboard',     icon: 'bi-bar-chart-fill',       label: 'Dashboard'      },
    { to: '/reunioes',      icon: 'bi-calendar3',            label: 'Reuniões'       },
    { to: '/relatorios',    icon: 'bi-clipboard-check-fill', label: 'Relatórios', adminOnly: true },
=======
    { to: '/pipeline',      icon: 'bi-people-fill',          label: 'Clientes'       },
    { to: '/dashboard',     icon: 'bi-bar-chart-fill',       label: 'Dashboard'      },
    { to: '/reunioes',      icon: 'bi-calendar3',            label: 'Reuniões'       },
    { to: '/relatorios',    icon: 'bi-clipboard-check-fill', label: 'Relatórios',    adminOnly: true },
>>>>>>> Stashed changes
    { to: '/configuracoes', icon: 'bi-gear',                 label: 'Configurações', adminOnly: true },
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Iniciais do nome para o avatar
  const iniciais = utilizador?.nome
    ? utilizador.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  return (
    <nav className={`sidebar ${expanded ? 'expandido' : ''}`}>
      <div className="sidebar-toggle" onClick={toggle}>
        <i className="bi bi-list"></i>
        <span className="sidebar-label">Menu</span>
      </div>
      <ul className="sidebar-nav">
        {navItems.map(item => {
          if (item.adminOnly && !isAdmin()) return null
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `sidebar-item ${isActive ? 'ativo' : ''}`}
              >
                <span className="sidebar-icon"><i className={`bi ${item.icon}`}></i></span>
                <span className="sidebar-text">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
<<<<<<< Updated upstream
=======

      {/* Utilizador + botão de sair (fundo da sidebar) */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{iniciais}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-nome">{utilizador?.nome}</span>
            <span className="sidebar-user-perfil">{utilizador?.perfil}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Sair">
          <i className="bi bi-box-arrow-left"></i>
          <span className="sidebar-text">Sair</span>
        </button>
      </div>

>>>>>>> Stashed changes
    </nav>
  )
}