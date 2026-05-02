import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import './RecuperarSenha.css'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // fetch('/api/auth/recuperar-senha', { method: 'POST', body: JSON.stringify({ email }) })
    setEnviado(true)
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
            <Link to="/login">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="login-hero rec-hero">
        <main className="login-form-box rec-box">
          {!enviado ? (
            <form onSubmit={handleSubmit}>
              <h1>Recuperar Senha</h1>
              <p className="rec-desc">
                Introduz o teu e-mail e o administrador irá redefinir o teu acesso.
              </p>
              <div className="login-input-box">
                <input
                  type="email"
                  placeholder="O teu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <i className="bi bi-envelope-fill"></i>
              </div>
              <button type="submit" className="login-btn" style={{ marginTop: 30 }}>
                Enviar Pedido
              </button>
              <div style={{ textAlign:'center', marginTop:16 }}>
                <Link to="/login" style={{ color:'rgba(215,252,234,0.6)', fontSize:14 }}>
                  ← Voltar ao Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="rec-enviado">
              <i className="bi bi-check-circle-fill"></i>
              <h2>Pedido enviado!</h2>
              <p>O administrador irá rever o teu pedido e redefinir a senha brevemente.</p>
              <Link to="/login" className="login-btn" style={{ display:'block', textAlign:'center', marginTop:24, textDecoration:'none', lineHeight:'50px' }}>
                Voltar ao Login
              </Link>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}
