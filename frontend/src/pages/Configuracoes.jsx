// frontend/src/pages/Configuracoes.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './Configuracoes.css'

export default function Configuracoes() {
  const navigate = useNavigate()
  
  const [utilizadores, setUtilizadores] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  const [metas, setMetas] = useState({ faturamento: 0, reunioes: 0, prospeccoes: 0 })
  const [metasSalvas, setMetasSalvas] = useState(false)
  const [guardandoMetas, setGuardandoMetas] = useState(false)
  
  const [confirmarId, setConfirmarId] = useState(null)
  const [removendo, setRemovendo] = useState(false)

  // Carrega lista real de utilizadores da API
  useEffect(() => {
    async function carregarUtilizadores() {
      try {
        const dados = await api.get('/utilizadores')
        setUtilizadores(dados)
      } catch (err) {
        console.error('Erro ao carregar utilizadores:', err.message)
      } finally {
        setLoadingUsers(false)
      }
    }
    carregarUtilizadores()
  }, [])

  const handleGuardarMetas = async (e) => {
    e.preventDefault()
    setGuardandoMetas(true)
    try {
      await api.put('/configuracoes/metas', metas)
      setMetasSalvas(true)
      setTimeout(() => setMetasSalvas(false), 2000)
    } catch (err) {
      alert('Erro ao guardar metas: ' + err.message)
    } finally {
      setGuardandoMetas(false)
    }
  }

  const handleRemoverUser = async (id) => {
    setRemovendo(true)
    try {
      await api.delete(`/utilizadores/${id}`)
      // Remove localmente sem precisar recarregar
      setUtilizadores(u => u.filter(u => u.id !== id))
      setConfirmarId(null)
    } catch (err) {
      alert('Erro ao remover: ' + err.message)
    } finally {
      setRemovendo(false)
    }
  }

  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
        <p className="config-sub">Apenas administradores têm acesso a esta área.</p>
      </div>

      <div className="config-body">

        <div className="config-card">
          <div className="config-card-header">
            <h2><i className="bi bi-people-fill"></i> Utilizadores do Sistema</h2>
            <button className="btn-novo-user" onClick={() => navigate('/criar-conta')}>
              <i className="bi bi-plus-lg"></i> Novo Utilizador
            </button>
          </div>

          {loadingUsers ? (
            <p style={{ padding: 20, color: 'var(--text-muted)' }}>A carregar...</p>
          ) : (
            <table className="config-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Membro desde</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                {utilizadores.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nome}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`perfil-badge ${u.perfil}`}>
                        {u.perfil === 'administrador' ? '👑 Admin' : '💼 Vendedor'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(u.criado_em).toLocaleDateString('pt-AO')}
                    </td>
                    <td>
                      <button
                        className="btn-acao apagar"
                        onClick={() => setConfirmarId(u.id)}
                        title="Remover utilizador"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="config-card">
          <h2 className="config-card-titulo">
            <i className="bi bi-bullseye"></i> Metas do Mês
          </h2>
          <form onSubmit={handleGuardarMetas} className="metas-form">
            <div className="form-group">
              <label>Meta de Faturamento (Kz)</label>
              <input
                type="number"
                value={metas.faturamento}
                onChange={e => setMetas(m => ({ ...m, faturamento: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Meta de Reuniões</label>
              <input
                type="number"
                value={metas.reunioes}
                onChange={e => setMetas(m => ({ ...m, reunioes: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Meta de Prospecções (por dia)</label>
              <input
                type="number"
                value={metas.prospeccoes}
                onChange={e => setMetas(m => ({ ...m, prospeccoes: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="metas-actions">
              {metasSalvas && (
                <span className="metas-sucesso">
                  <i className="bi bi-check-circle-fill"></i> Metas guardadas!
                </span>
              )}
              <button type="submit" className="btn-guardar-metas" disabled={guardandoMetas}>
                <i className="bi bi-floppy-fill"></i>
                {guardandoMetas ? ' A guardar...' : ' Guardar Metas'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {confirmarId && (
        <div className="modal-overlay" onClick={() => setConfirmarId(null)}>
          <div className="modal-confirm-box" onClick={e => e.stopPropagation()}>
            <h2>Remover utilizador?</h2>
            <p>Esta acção não pode ser revertida.</p>
            <div className="confirm-acoes">
              <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>
                Cancelar
              </button>
              <button
                className="btn-apagar-confirm"
                onClick={() => handleRemoverUser(confirmarId)}
                disabled={removendo}
              >
                {removendo ? 'A remover...' : 'Sim, remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}