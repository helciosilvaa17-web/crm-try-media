import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import './Navbar.css'

export default function Navbar() {
  const { expanded } = useSidebar()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [mostrarDrop, setMostrarDrop] = useState(false)
  const searchRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/login') }

  // Pesquisa com debounce — espera 300ms após última tecla
  useEffect(() => {
    if (!search.trim()) { setSugestoes([]); setMostrarDrop(false); return }
    const timer = setTimeout(async () => {
      try {
        const dados = await api.get(`/clientes?pesquisa=${encodeURIComponent(search)}`)
        setSugestoes(dados.slice(0, 6))
        setMostrarDrop(true)
      } catch { setSugestoes([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setMostrarDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSugestao = (cliente) => {
    setSearch('')
    setSugestoes([])
    setMostrarDrop(false)
    navigate(`/cliente/${cliente.id}`)
  }

  return (
    <header className={`navbar ${expanded ? 'expandido' : ''}`}>
      <div className="navbar-container">

        <div className="navbar-logo">
          <img src="/assets/Logo TRY MEDIA.png" alt="TRY MEDIA" />
        </div>

        <div className="navbar-actions">

          {/* Pesquisa com sugestões */}
          <div className="navbar-search" ref={searchRef}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Pesquisar lead..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => sugestoes.length > 0 && setMostrarDrop(true)}
            />
            {mostrarDrop && sugestoes.length > 0 && (
              <div className="search-dropdown">
                {sugestoes.map(c => (
                  <div
                    key={c.id}
                    className="search-item"
                    onClick={() => handleSugestao(c)}
                  >
                    <div className="search-item-nome">{c.nome_empresa}</div>
                    <div className="search-item-meta">
                      <span className={`badge ${c.status}`} style={{ fontSize: 11 }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {c.nicho}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão novo lead */}
          <button className="btn-novo-cliente" onClick={() => navigate('/pipeline')}>
            + Novo Lead
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