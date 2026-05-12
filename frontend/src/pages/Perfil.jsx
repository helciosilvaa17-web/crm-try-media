// frontend/src/pages/Perfil.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import './Perfil.css'

export default function Perfil() {
  const { user, login } = useAuth()
  
  const [form, setForm] = useState({
    nome: user?.nome || '',
    email: user?.email || ''
  })
  const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handlePerfil = async (e) => {
    e.preventDefault()
    setErro('')
    setGuardando(true)
    try {
      await api.put('/perfil', { nome: form.nome, email: form.email })
      setSucesso('Perfil actualizado!')
      
      // Actualizamos também o utilizador no contexto e localStorage
      // para que o nome na Navbar actualize imediatamente
      const userActualizado = { ...user, nome: form.nome, email: form.email }
      localStorage.setItem('crm_user', JSON.stringify(userActualizado))
      login(userActualizado, localStorage.getItem('crm_token'))
      
      setTimeout(() => setSucesso(''), 2000)
    } catch (err) {
      setErro(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleSenha = async (e) => {
    e.preventDefault()
    setErro('')
    if (senhas.novaSenha !== senhas.confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    setGuardando(true)
    try {
      await api.put('/perfil', {
        nome: form.nome,
        email: form.email,
        senhaAtual: senhas.senhaAtual,
        novaSenha: senhas.novaSenha
      })
      setSucesso('Senha alterada!')
      setSenhas({ senhaAtual: '', novaSenha: '', confirmar: '' })
      setTimeout(() => setSucesso(''), 2000)
    } catch (err) {
      setErro(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-avatar">
          <i className="bi bi-person-circle"></i>
        </div>
        <div>
          <h1>{user?.nome}</h1>
          <span className={`perfil-badge ${user?.perfil}`}>
            {user?.perfil === 'administrador' ? 'Administrador' : 'Vendedor'}
          </span>
        </div>
      </div>

      {sucesso && (
        <div className="perfil-sucesso">
          <i className="bi bi-check-circle-fill"></i> {sucesso}
        </div>
      )}
      {erro && (
        <div className="perfil-erro">
          <i className="bi bi-exclamation-circle-fill"></i> {erro}
        </div>
      )}

      <div className="perfil-body">
        <div className="perfil-card">
          <h2><i className="bi bi-person-fill"></i> Dados Pessoais</h2>
          <form onSubmit={handlePerfil} className="perfil-form">
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-guardar-perfil" disabled={guardando}>
              {guardando ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </form>
        </div>

        <div className="perfil-card">
          <h2><i className="bi bi-lock-fill"></i> Alterar Senha</h2>
          <form onSubmit={handleSenha} className="perfil-form">
            <div className="form-group">
              <label>Senha Actual</label>
              <input
                type="password"
                value={senhas.senhaAtual}
                onChange={e => setSenhas(s => ({ ...s, senhaAtual: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Nova Senha</label>
              <input
                type="password"
                value={senhas.novaSenha}
                onChange={e => setSenhas(s => ({ ...s, novaSenha: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                value={senhas.confirmar}
                onChange={e => setSenhas(s => ({ ...s, confirmar: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-guardar-perfil" disabled={guardando}>
              {guardando ? 'A alterar...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}