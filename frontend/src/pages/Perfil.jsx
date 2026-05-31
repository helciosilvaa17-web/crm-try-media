import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import './Perfil.css'

export default function Perfil() {
  const { user, login } = useAuth()
  const [editando, setEditando]   = useState(false)
  const [form, setForm]           = useState({ nome: user?.nome || '', email: user?.email || '' })
  const [senhas, setSenhas]       = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [stats, setStats]         = useState(null)
  const [sucesso, setSucesso]     = useState('')
  const [erro, setErro]           = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function carregarStats() {
      try {
        const dados = await api.get('/dashboard')
        setStats(dados)
      } catch {}
    }
    carregarStats()
  }, [])

  const tempoNaEmpresa = () => {
    if (!user?.criado_em) return '—'
    const inicio = new Date(user.criado_em)
    const agora  = new Date()
    const meses  = (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth())
    if (meses < 1) return 'Menos de 1 mês'
    if (meses < 12) return `${meses} mês${meses > 1 ? 'es' : ''}`
    const anos = Math.floor(meses / 12)
    return `${anos} ano${anos > 1 ? 's' : ''}`
  }

  const handlePerfil = async (e) => {
    e.preventDefault()
    setErro('')
    setGuardando(true)
    try {
      await api.put('/perfil', { nome: form.nome, email: form.email })
      const userActualizado = { ...user, nome: form.nome, email: form.email }
      localStorage.setItem('crm_user', JSON.stringify(userActualizado))
      login(userActualizado, localStorage.getItem('crm_token'))
      setSucesso('Perfil actualizado!')
      setEditando(false)
      setTimeout(() => setSucesso(''), 2500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleSenha = async (e) => {
    e.preventDefault()
    setErro('')
    if (senhas.novaSenha !== senhas.confirmar) { setErro('As senhas não coincidem.'); return }
    setGuardando(true)
    try {
      await api.put('/perfil', { nome: form.nome, email: form.email, senhaAtual: senhas.senhaAtual, novaSenha: senhas.novaSenha })
      setSucesso('Senha alterada!')
      setSenhas({ senhaAtual: '', novaSenha: '', confirmar: '' })
      setTimeout(() => setSucesso(''), 2500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="perfil-page">

      {sucesso && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#27ae60', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>{sucesso}</div>
      )}

      {/* ── Vista de dados ─────────────────────────────── */}
      {!editando && (
        <>
          <div className="perfil-header">
            <div className="perfil-avatar">
              <i className="bi bi-person-circle" style={{ fontSize: 64, color: 'var(--accent)' }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{user?.nome}</h1>
              <span className={`perfil-badge ${user?.perfil}`}>
                {user?.perfil === 'administrador' ? 'Administrador' : 'Vendedor'}
              </span>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>{user?.email}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                Na empresa há: <strong style={{ color: 'var(--text)' }}>{tempoNaEmpresa()}</strong>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, margin: '24px 0', flexWrap: 'wrap' }}>
            <div className="kpi-card" style={{ flex: 1, minWidth: 160 }}>
              <div>
                <span className="kpi-valor">{stats?.kpis?.totalLeads ?? '—'}</span>
                <span className="kpi-label">Leads atribuídos</span>
              </div>
            </div>
            <div className="kpi-card" style={{ flex: 1, minWidth: 160 }}>
              <div>
                <span className="kpi-valor">{stats?.reunioes?.length ?? '—'}</span>
                <span className="kpi-label">Próximas reuniões</span>
              </div>
            </div>
            <div className="kpi-card" style={{ flex: 1, minWidth: 160 }}>
              <div>
                <span className="kpi-valor">
                  {stats?.meta
                    ? Number(stats.meta.realizado).toLocaleString('pt-AO') + ' Kz'
                    : '—'}
                </span>
                <span className="kpi-label">Faturado este mês</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditando(true)}
            className="btn-guardar-metas"
            style={{ marginBottom: 24 }}
          >
            <i className="bi bi-pencil-square"></i> Editar Perfil
          </button>
        </>
      )}

      {/* ── Modo edição ────────────────────────────────── */}
      {editando && (
        <div className="perfil-body">
          {erro && (
            <div style={{ color: '#e74c3c', marginBottom: 16, padding: '10px 14px', background: 'rgba(231,76,60,0.1)', borderRadius: 8 }}>
              {erro}
            </div>
          )}

          <div className="perfil-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2><i className="bi bi-person-fill"></i> Dados Pessoais</h2>
              <button onClick={() => setEditando(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handlePerfil} className="perfil-form">
              <div className="form-group">
                <label>Nome Completo</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
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
                <input type="password" value={senhas.senhaAtual} onChange={e => setSenhas(s => ({ ...s, senhaAtual: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input type="password" value={senhas.novaSenha} onChange={e => setSenhas(s => ({ ...s, novaSenha: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input type="password" value={senhas.confirmar} onChange={e => setSenhas(s => ({ ...s, confirmar: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-guardar-perfil" disabled={guardando}>
                {guardando ? 'A alterar...' : 'Alterar Senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}