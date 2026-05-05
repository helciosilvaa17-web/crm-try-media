// frontend/src/pages/FichaCliente.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './FichaCliente.css'

const LABELS_STATUS = {
  novo: 'Novo', contacto: 'Contacto Inicial', qualificado: 'Qualificado',
  negociacao: 'Negociação', progresso: 'Em Progresso', fechado: 'Fechado',
}

const TIPO_ICON = {
  whatsapp: 'bi-whatsapp',
  'ligação': 'bi-telephone-fill',
  'reunião': 'bi-camera-video-fill',
  email:    'bi-envelope-fill',
}

export default function FichaCliente() {
  // useParams() lê o :id da URL — ex: /cliente/3 → id = "3"
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [cliente, setCliente] = useState(null)
  const [interacoes, setInteracoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'whatsapp', nota: '' })
  const [adicionando, setAdicionando] = useState(false)
  const [guardandoInteracao, setGuardandoInteracao] = useState(false)

  // Carrega os dados do cliente quando o componente monta
  // ou quando o id muda (navegação entre fichas)
  useEffect(() => {
    async function carregarCliente() {
      try {
        setLoading(true)
        setErro(null)
        
        // GET /api/clientes/:id — devolve { ...cliente, interacoes: [...] }
        const dados = await api.get(`/clientes/${id}`)
        
        setCliente(dados)
        setInteracoes(dados.interacoes || [])
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    carregarCliente()
  }, [id])  // id nas dependências — se mudar o cliente na URL, recarrega

  const handleAdicionarInteracao = async (e) => {
    e.preventDefault()
    if (!novaInteracao.nota.trim()) return
    
    setGuardandoInteracao(true)
    try {
      // POST /api/clientes/:id/interacoes
      await api.post(`/clientes/${id}/interacoes`, novaInteracao)
      
      // Após criar, vamos buscar a ficha completa de novo
      // para termos a interacção com a data real do servidor
      const dados = await api.get(`/clientes/${id}`)
      setInteracoes(dados.interacoes || [])
      
      setNovaInteracao({ tipo: 'whatsapp', nota: '' })
      setAdicionando(false)
    } catch (err) {
      alert('Erro ao registar interacção: ' + err.message)
    } finally {
      setGuardandoInteracao(false)
    }
  }

  const formatKz = (v) => Number(v || 0).toLocaleString('pt-AO') + ' Kz'

  if (loading) {
    return (
      <div className="ficha-page">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          A carregar ficha do cliente...
        </div>
      </div>
    )
  }

  if (erro || !cliente) {
    return (
      <div className="ficha-page">
        <div style={{ textAlign: 'center', padding: 80, color: '#e74c3c' }}>
          {erro || 'Cliente não encontrado.'}
        </div>
      </div>
    )
  }

  return (
    <div className="ficha-page">

      <div className="ficha-breadcrumb">
        <button onClick={() => navigate('/pipeline')} className="btn-voltar">
          <i className="bi bi-arrow-left"></i> Pipeline
        </button>
        <span className="breadcrumb-sep">/</span>
        <span>{cliente.nome_empresa}</span>
      </div>

      <div className="ficha-header">
        <div className="ficha-header-left">
          <h1>{cliente.nome_empresa}</h1>
          <div className="ficha-meta">
            <span className={`badge ${cliente.status}`}>
              {LABELS_STATUS[cliente.status]}
            </span>
            <span className="ficha-nicho">{cliente.nicho}</span>
            <span className="ficha-prioridade">
              Prioridade: <strong>{cliente.prioridade}</strong>
            </span>
          </div>
        </div>
        <div className="ficha-header-actions">
          <button
            className="btn-wpp"
            onClick={() => cliente.whatsapp && window.open(`https://wa.me/244${cliente.whatsapp}`, '_blank')}
          >
            <i className="bi bi-whatsapp"></i> WhatsApp
          </button>
        </div>
      </div>

      <div className="ficha-body">

        <div className="ficha-col">
          <div className="ficha-card">
            <h2 className="ficha-card-titulo">
              <i className="bi bi-info-circle-fill"></i> Dados do Cliente
            </h2>
            <div className="ficha-dados-grid">
              <div className="ficha-dado">
                <span className="dado-label">Valor Estimado</span>
                <span className="dado-valor accent">{formatKz(cliente.valor_estimado)}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Vendedor</span>
                <span className="dado-valor">{cliente.vendedor_nome || '—'}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Telefone</span>
                <span className="dado-valor">{cliente.telefone || '—'}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">E-mail</span>
                <span className="dado-valor">{cliente.email || '—'}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Último Contacto</span>
                <span className="dado-valor">
                  {cliente.ultimo_contacto
                    ? new Date(cliente.ultimo_contacto).toLocaleDateString('pt-AO')
                    : '—'}
                </span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Fecho Previsto</span>
                <span className="dado-valor">
                  {cliente.fecho_previsto
                    ? new Date(cliente.fecho_previsto).toLocaleDateString('pt-AO')
                    : '—'}
                </span>
              </div>
            </div>

            {cliente.link_info && (
              <a href={cliente.link_info} target="_blank" rel="noreferrer" className="btn-link-info">
                <i className="bi bi-box-arrow-up-right"></i> Ver informações externas
              </a>
            )}
          </div>

          <div className="ficha-card">
            <h2 className="ficha-card-titulo">
              <i className="bi bi-sticky-fill"></i> Observações
            </h2>
            <p className="ficha-obs">
              {cliente.observacoes || 'Sem observações registadas.'}
            </p>
          </div>
        </div>

        <div className="ficha-col">
          <div className="ficha-card ficha-card-interacoes">
            <div className="interacoes-header">
              <h2 className="ficha-card-titulo">
                <i className="bi bi-clock-history"></i> Histórico de Interacções
              </h2>
              <button className="btn-add-interacao" onClick={() => setAdicionando(a => !a)}>
                <i className="bi bi-plus-lg"></i> Registar
              </button>
            </div>

            {adicionando && (
              <form onSubmit={handleAdicionarInteracao} className="form-interacao">
                <div className="form-row-interacao">
                  <select
                    value={novaInteracao.tipo}
                    onChange={e => setNovaInteracao(n => ({ ...n, tipo: e.target.value }))}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligação">Ligação</option>
                    <option value="reunião">Reunião</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  placeholder="Descreve o que aconteceu nesta interacção..."
                  value={novaInteracao.nota}
                  onChange={e => setNovaInteracao(n => ({ ...n, nota: e.target.value }))}
                  required
                />
                <div className="form-interacao-acoes">
                  <button
                    type="button"
                    className="btn-cancelar-modal"
                    onClick={() => setAdicionando(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-guardar-modal"
                    disabled={guardandoInteracao}
                  >
                    {guardandoInteracao ? 'A guardar...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            <div className="interacoes-list">
              {interacoes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  Sem interacções registadas.
                </p>
              )}
              {interacoes.map(inter => (
                <div key={inter.id} className="interacao-item">
                  <div className="interacao-icon">
                    <i className={`bi ${TIPO_ICON[inter.tipo] || 'bi-chat-fill'}`}></i>
                  </div>
                  <div className="interacao-corpo">
                    <div className="interacao-meta">
                      <span className="interacao-tipo">{inter.tipo}</span>
                      <span className="interacao-data">
                        {new Date(inter.data).toLocaleDateString('pt-AO')} · {new Date(inter.data).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="interacao-nota">{inter.nota}</p>
                    {inter.utilizador_nome && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        — {inter.utilizador_nome}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}