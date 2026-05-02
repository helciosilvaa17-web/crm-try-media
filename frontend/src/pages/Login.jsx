import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.mensagem || 'Credenciais inválidas')
        return
      }

      login(data.utilizador, data.token)
      navigate('/dashboard')
    } catch {
      setErro('Erro ao conectar ao servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* Vídeo de fundo */}
      <div className="login-bg">
        <video src="/assets/f6d47b04-8cea-4c65-8286-c0fce37ac8fc.mp4" autoPlay loop muted />
      </div>

      {/* Overlay gradiente */}
      <div className="login-overlay" />

      {/* Navbar */}
      <header className="login-nav">
        <div className="login-nav-container">
          <img src="/assets/Logo TRY MEDIA.png" alt="TRY MEDIA" className="login-logo" />
          <nav className="login-menu">
            <a href="#">Início</a>
            <a href="#">Sobre</a>
            <Link to="/login">Entrar</Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <section className="login-hero">

        {/* Lado esquerdo */}
        <div className="login-left">
          <h1>Olá Novamente!</h1>
          <p>
            Bem-vindo de volta ao seu CRM de Eleição.<br />
            Acesse sua conta para continuar a gerir clientes, projectos,
            organizar informações, acompanhar prazos e garantir maior
            eficiência na execução dos serviços e na visualização do
            funil de vendas.
          </p>
        </div>

        {/* Formulário */}
        <main className="login-form-box">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>

            {erro && <div className="login-erro">{erro}</div>}

            <div className="login-input-box">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <i className="bi bi-person-fill"></i>
            </div>

            <div className="login-input-box">
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
              <i className="bi bi-lock-fill"></i>
            </div>

            <div className="login-remember">
              <label>
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={e => setLembrar(e.target.checked)}
                />
                Lembrar senha
              </label>
              <Link to="/recuperar-senha">Esqueci a senha</Link>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'A entrar...' : 'Login'}
            </button>

          </form>
        </main>

      </section>
    </div>
  )
}
