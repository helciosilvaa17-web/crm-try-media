import { NavLink } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

export default function Sidebar() {
  const { expanded, toggle } = useSidebar()
  const { isAdmin } = useAuth()

  const navItems = [
    { to: '/pipeline',      icon: 'bi-people-fill',         label: 'Clientes'       },
    { to: '/dashboard',     icon: 'bi-bar-chart-fill',      label: 'Dashboard'      },
    { to: '/reunioes',      icon: 'bi-calendar3',           label: 'Reuniões'       },
    { to: '/relatorios',    icon: 'bi-clipboard-check-fill', label: 'Relatórios', adminOnly: true },
    { to: '/configuracoes', icon: 'bi-gear',                label: 'Configurações', adminOnly: true },
  ]

  return (
    <nav className={`sidebar ${expanded ? 'expandido' : ''}`}>

      {/* Botão expandir */}
      <div className="sidebar-toggle" onClick={toggle}>
        <i className="bi bi-list"></i>
        <span className="sidebar-label">Menu</span>
      </div>

      {/* Itens de navegação */}
      <ul className="sidebar-nav">
        {navItems.map(item => {
          if (item.adminOnly && !isAdmin()) return null
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'ativo' : ''}`
                }
              >
                <span className="sidebar-icon">
                  <i className={`bi ${item.icon}`}></i>
                </span>
                <span className="sidebar-text">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>

    </nav>
  )
}
