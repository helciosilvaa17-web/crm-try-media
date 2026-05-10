// frontend/src/pages/Configuracoes.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './Configuracoes.css'

export default function Configuracoes() {
  const navigate = useNavigate()

  const [utilizadores, setUtilizadores] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Meta global
  const [metaGlobal, setMetaGlobal] = useState({
    faturamento: 0, reunioes: 0, prospeccoes: 0
  })

  // Metas individuais dos vendedores — array dinâmico
  const [metasVendedor, setMetasVendedor] = useState([])

  // Taxas de conversão esperadas
  const [taxas, setTaxas] = useState({
    taxa_conexao: 0, taxa_agendamento: 0,
    taxa_realizacao: 0, taxa_fechamento: 0
  })

  const [guardandoMetas, setGuardandoMetas] = useState(false)
  const [guardandoTaxas, setGuardandoTaxas] = useState(false)
  const [confirmarId, setConfirmarId] = useState(null)
  const [removendo, setRemovendo] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Carrega tudo ao montar
  useEffect(() => {
    async function carregar() {
      try {
        const [users, config] = await Promise.all([
          api.get('/utilizadores'),
          api.get('/configuracoes/metas')
        ])

        setUtilizadores(users)

        // Preenche metas globais se existirem
        if (config.metaGlobal) {
          setMetaGlobal({
            faturamento: config.metaGlobal.meta_faturamento || 0,
            reunioes:    config.metaGlobal.meta_reunioes    || 0,
            prospeccoes: config.metaGlobal.meta_prospeccoes || 0,
          })
        }

        // Metas por vendedor — para cada vendedor que não tem meta ainda,
        // criamos uma entrada vazia para o formulário mostrar
        const vendedores = users.filter(u => u.perfil === 'vendedor')
        const metasExistentes = config.metasVendedor || []

        const metasCompletas = vendedores.map(v => {
          const metaExistente = metasExistentes.find(m => m.vendedor_id === v.id)
          return {
            vendedor_id:   v.id,
            vendedor_nome: v.nome,
            meta_reunioes: metaExistente?.meta_reunioes || 0
          }
        })
        setMetasVendedor(metasCompletas)

        // Taxas
        if (config.taxas) {
          setTaxas({
            taxa_conexao:     config.taxas.taxa_conexao     || 0,
            taxa_agendamento: config.taxas.taxa_agendamento || 0,
            taxa_realizacao:  config.taxas.taxa_realizacao  || 0,
            taxa_fechamento:  config.taxas.taxa_fechamento  || 0,
          })
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
      } finally {
        setLoadingUsers(false)
      }
    }
    carregar()
  }, [])

  const mostrarFeedback = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2500)
  }

  const handleGuardarMetas = async (e) => {
    e.preventDefault()
    setGuardandoMetas(true)
    try {
      await api.put('/configuracoes/metas', {
        ...metaGlobal,
        metasVendedor  // array com { vendedor_id, meta_reunioes }
      })
      mostrarFeedback('Metas guardadas com sucesso!')
    } catch (err) {
      mostrarFeedback('Erro: ' + err.message)
    } finally {
      setGuardandoMetas(false)
    }
  }

  const handleGuardarTaxas = async (e) => {
    e.preventDefault()
    setGuardandoTaxas(true)
    try {
      await api.put('/configuracoes/taxas', taxas)
      mostrarFeedback('Taxas guardadas com sucesso!')
    } catch (err) {
      mostrarFeedback('Erro: ' + err.message)
    } finally {
      setGuardandoTaxas(false)
    }
  }

  const handleRemoverUser = async (id) => {
    setRemovendo(true)
    try {
      await api.delete(`/utilizadores/${id}`)
      setUtilizadores(u => u.filter(u => u.id !== id))
      setMetasVendedor(m => m.filter(m => m.vendedor_id !== id))
      setConfirmarId(null)
    } catch (err) {
      alert('Erro ao remover: ' + err.message)
    } finally {
      setRemovendo(false)
    }
  }

  const actualizarMetaVendedor = (vendedorId, valor) => {
    setMetasVendedor(prev =>
      prev.map(m =>
        m.vendedor_id === vendedorId
          ? { ...m, meta_reunioes: Number(valor) }
          : m
      )
    )
  }

  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
        <p className="config-sub">Apenas administradores têm acesso a esta área.</p>
      </div>

      {/* Feedback global */}
      {feedback && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: feedback.startsWith('Erro') ? '#e74c3c' : '#27ae60',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {feedback}
        </div>
      )}

      <div className="config-body">

        {/* ── Utilizadores ──────────────────────────────────────── */}
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
                  <th>Nome</th><th>E-mail</th><th>Perfil</th>
                  <th>Membro desde</th><th>Acções</th>
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
                        title="Remover"
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

        {/* ── Metas ─────────────────────────────────────────────── */}
        <div className="config-card">
          <h2 className="config-card-titulo">
            <i className="bi bi-bullseye"></i> Metas do Mês
          </h2>
          <form onSubmit={handleGuardarMetas} className="metas-form">

            {/* Meta global */}
            <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
              Equipa
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Faturamento Global (Kz)</label>
                <input
                  type="number"
                  value={metaGlobal.faturamento}
                  onChange={e => setMetaGlobal(m => ({ ...m, faturamento: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prospecções por dia</label>
                <input
                  type="number"
                  value={metaGlobal.prospeccoes}
                  onChange={e => setMetaGlobal(m => ({ ...m, prospeccoes: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            {/* Metas por vendedor */}
            {metasVendedor.length > 0 && (
              <>
                <h3 style={{
                  fontSize: 14, color: 'var(--text-muted)',
                  margin: '20px 0 12px'
                }}>
                  Meta de Reuniões por Vendedor
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {metasVendedor.map(mv => (
                    <div key={mv.vendedor_id} style={{
                      display: 'flex', alignItems: 'center',
                      gap: 16, padding: '10px 14px',
                      background: 'var(--border)', borderRadius: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <i className="bi bi-person-circle" style={{ fontSize: 20, opacity: 0.6 }}></i>
                        <span style={{ fontWeight: 600 }}>{mv.vendedor_nome}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Meta de reuniões:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={mv.meta_reunioes}
                          onChange={e => actualizarMetaVendedor(mv.vendedor_id, e.target.value)}
                          style={{
                            width: 80, padding: '6px 10px',
                            borderRadius: 8, border: '1px solid var(--border)',
                            background: 'var(--card)', color: 'var(--text)',
                            textAlign: 'center', fontSize: 15, fontWeight: 700
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="metas-actions" style={{ marginTop: 20 }}>
              <button type="submit" className="btn-guardar-metas" disabled={guardandoMetas}>
                <i className="bi bi-floppy-fill"></i>
                {guardandoMetas ? ' A guardar...' : ' Guardar Metas'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Taxas de Conversão ────────────────────────────────── */}
        <div className="config-card">
          <h2 className="config-card-titulo">
            <i className="bi bi-graph-up-arrow"></i> Taxas de Conversão Esperadas
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Define as taxas que a equipa deve atingir. Serão comparadas com os resultados reais nos Relatórios.
          </p>
          <form onSubmit={handleGuardarTaxas} className="metas-form">
            <div className="form-row">
              <div className="form-group">
                <label>Taxa de Conexão (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={taxas.taxa_conexao}
                  onChange={e => setTaxas(t => ({ ...t, taxa_conexao: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Taxa de Agendamento (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={taxas.taxa_agendamento}
                  onChange={e => setTaxas(t => ({ ...t, taxa_agendamento: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Taxa de Realização (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={taxas.taxa_realizacao}
                  onChange={e => setTaxas(t => ({ ...t, taxa_realizacao: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Taxa de Fechamento (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={taxas.taxa_fechamento}
                  onChange={e => setTaxas(t => ({ ...t, taxa_fechamento: e.target.value }))}
                />
              </div>
            </div>
            <div className="metas-actions" style={{ marginTop: 12 }}>
              <button type="submit" className="btn-guardar-metas" disabled={guardandoTaxas}>
                <i className="bi bi-floppy-fill"></i>
                {guardandoTaxas ? ' A guardar...' : ' Guardar Taxas'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Modal confirmação */}
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