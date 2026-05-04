import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Configuracoes.css'

const MOCK_USERS = [
  { id: 1, nome: 'Hélcio Silva',  email: 'helcio@trymedia.ao',  perfil: 'administrador' },
  { id: 3, nome: 'João Manuel',   email: 'joao@trymedia.ao',     perfil: 'vendedor'      },
]

const MOCK_METAS = { faturamento: 2325000, reunioes: 40, prospeccoes: 4 }

export default function Configuracoes() {
  const navigate = useNavigate()
  const [utilizadores, setUtilizadores] = useState(MOCK_USERS)
  const [metas, setMetas] = useState(MOCK_METAS)
  const [metasSalvas, setMetasSalvas] = useState(false)
  const [confirmarId, setConfirmarId] = useState(null)

  const handleGuardarMetas = (e) => {
    e.preventDefault()
    // fetch('/api/configuracoes/metas', { method: 'PUT', body: JSON.stringify(metas), ... })
    setMetasSalvas(true)
    setTimeout(() => setMetasSalvas(false), 2000)
  }

  const handleRemoverUser = (id) => {
    setUtilizadores(u => u.filter(u => u.id !== id))
    setConfirmarId(null)
  }

  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
        <p className="config-sub">Apenas administradores têm acesso a esta área.</p>
      </div>

      <div className="config-body">

        {/* Utilizadores */}
        <div className="config-card">
          <div className="config-card-header">
            <h2><i className="bi bi-people-fill"></i> Utilizadores do Sistema</h2>
            <button className="btn-novo-user" onClick={() => navigate('/criar-conta')}>
              <i className="bi bi-plus-lg"></i> Novo Utilizador
            </button>
          </div>

          <table className="config-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
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
        </div>

        {/* Metas */}
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
                onChange={e => setMetas(m => ({...m, faturamento: Number(e.target.value)}))}
                required
              />
            </div>
            <div className="form-group">
              <label>Meta de Reuniões</label>
              <input
                type="number"
                value={metas.reunioes}
                onChange={e => setMetas(m => ({...m, reunioes: Number(e.target.value)}))}
                required
              />
            </div>
            <div className="form-group">
              <label>Meta de Prospecções (por dia)</label>
              <input
                type="number"
                value={metas.prospeccoes}
                onChange={e => setMetas(m => ({...m, prospeccoes: Number(e.target.value)}))}
                required
              />
            </div>
            <div className="metas-actions">
              {metasSalvas && (
                <span className="metas-sucesso">
                  <i className="bi bi-check-circle-fill"></i> Metas guardadas!
                </span>
              )}
              <button type="submit" className="btn-guardar-metas">
                <i className="bi bi-floppy-fill"></i> Guardar Metas
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Confirm remover */}
      {confirmarId && (
        <div className="modal-overlay" onClick={() => setConfirmarId(null)}>
          <div className="modal-confirm-box" onClick={e => e.stopPropagation()}>
            <h2>Remover utilizador?</h2>
            <p>Esta acção não pode ser revertida.</p>
            <div className="confirm-acoes">
              <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>Cancelar</button>
              <button className="btn-apagar-confirm" onClick={() => handleRemoverUser(confirmarId)}>
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
