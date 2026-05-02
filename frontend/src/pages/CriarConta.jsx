import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'
import './CriarConta.css'

export default function CriarConta() {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '', perfil: ''
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (!form.perfil) {
      setErro('Selecciona uma função.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/criar-conta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          perfil: form.perfil
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.mensagem || 'Erro ao criar conta.')
        return
      }
      setSucesso('Utilizador criado com sucesso!')
      setTimeout(() => navigate('/configuracoes'), 1500)
    } catch {
      setErro('Erro ao conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <video src="/assets/f6d47b04-8cea-4c65-8286-c0fce37ac8fc.mp4" autoPlay loop muted />
      </div>
      <div className="login-overlay" />

      <header className="login-nav">
        <div className="login-nav-container">
          <img src="/assets/Logo TRY MEDIA.png" alt="TRY MEDIA" className="login-logo" />
          <nav className="login-menu">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/configuracoes">Configurações</Link>
          </nav>
        </div>
      </header>

      <section className="login-hero">
        <div className="login-left">
          <img src="/assets/Logo TRY MEDIA.png" className="criar-logo" alt="TRY MEDIA" />
          <p>
            Crie uma conta para que um novo utilizador possa aceder à
            plataforma. Define o seu perfil de acesso para controlar o
            que pode visualizar e gerir no sistema.
          </p>
        </div>

        <main className="login-form-box">
          <form onSubmit={handleSubmit}>
            <h1>Criar Conta</h1>

            {erro    && <div className="login-erro">{erro}</div>}
            {sucesso && <div className="login-sucesso">{sucesso}</div>}

            <div className="login-input-box">
              <input name="nome" type="text" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="login-input-box">
              <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
              <i className="bi bi-envelope-fill"></i>
            </div>
            <div className="login-input-box">
              <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
              <i className="bi bi-lock-fill"></i>
            </div>
            <div className="login-input-box">
              <input name="confirmarSenha" type="password" placeholder="Confirmar senha" value={form.confirmarSenha} onChange={handleChange} required />
              <i className="bi bi-lock-fill"></i>
            </div>

            <div className="login-input-box criar-select-box">
              <select name="perfil" value={form.perfil} onChange={handleChange} required>
                <option value="" disabled>Função</option>
                <option value="administrador">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
              <i className="bi bi-chevron-down"></i>
            </div>

            <div className="criar-botoes">
              <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn-guardar" disabled={loading}>
                {loading ? 'A guardar...' : 'Guardar Utilizador'}
              </button>
            </div>
          </form>
        </main>
      </section>
    </div>
  )
}
