// PERFIL.JSX
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Perfil.css'

export default function Perfil() {
  const { user } = useAuth()
  const [form, setForm] = useState({ nome: user?.nome || '', email: user?.email || '' })
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  const handlePerfil = (e) => {
    e.preventDefault()
    setSucesso('Perfil actualizado!')
    setTimeout(() => setSucesso(''), 2000)
  }

  const handleSenha = (e) => {
    e.preventDefault()
    setErro('')
    if (senhas.nova !== senhas.confirmar) { setErro('As senhas não coincidem.'); return }
    setSucesso('Senha alterada!')
    setSenhas({ atual: '', nova: '', confirmar: '' })
    setTimeout(() => setSucesso(''), 2000)
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
            {user?.perfil === 'administrador' ? '👑 Administrador' : '💼 Vendedor'}
          </span>
        </div>
      </div>

      {sucesso && <div className="perfil-sucesso"><i className="bi bi-check-circle-fill"></i> {sucesso}</div>}
      {erro    && <div className="perfil-erro"><i className="bi bi-exclamation-circle-fill"></i> {erro}</div>}

      <div className="perfil-body">
        {/* Dados */}
        <div className="perfil-card">
          <h2><i className="bi bi-person-fill"></i> Dados Pessoais</h2>
          <form onSubmit={handlePerfil} className="perfil-form">
            <div className="form-group">
              <label>Nome Completo</label>
              <input value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <button type="submit" className="btn-guardar-perfil">Guardar Alterações</button>
          </form>
        </div>

        {/* Senha */}
        <div className="perfil-card">
          <h2><i className="bi bi-lock-fill"></i> Alterar Senha</h2>
          <form onSubmit={handleSenha} className="perfil-form">
            <div className="form-group">
              <label>Senha Actual</label>
              <input type="password" value={senhas.atual} onChange={e => setSenhas(s => ({...s, atual: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Nova Senha</label>
              <input type="password" value={senhas.nova} onChange={e => setSenhas(s => ({...s, nova: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Confirmar Nova Senha</label>
              <input type="password" value={senhas.confirmar} onChange={e => setSenhas(s => ({...s, confirmar: e.target.value}))} required />
            </div>
            <button type="submit" className="btn-guardar-perfil">Alterar Senha</button>
          </form>
        </div>
      </div>
    </div>
  )
}
