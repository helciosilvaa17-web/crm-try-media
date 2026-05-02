import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './FichaCliente.css'

// Mock — substituir por fetch('/api/clientes/:id')
const MOCK_CLIENTE = {
  id: 1,
  empresa: 'Grupo Alpha',
  nicho: 'Marketing',
  status: 'fechado',
  prioridade: 'Alta',
  valor: 200000,
  vendedor: 'Hélcio',
  telefone: '923000001',
  email: 'geral@grupoalpha.ao',
  whatsapp: '923000001',
  ultimoContacto: '2026-05-12',
  fechoPrevisto: '2026-05-20',
  linkInfo: 'https://notion.so/grupoalpha',
  observacoes: 'Cliente de alto potencial. Reunião de diagnóstico realizada. Aguarda aprovação interna.',
}

const MOCK_INTERACOES = [
  { id: 1, tipo: 'reunião',  data: '12/05/2026 · 10h00', nota: 'Reunião de diagnóstico realizada com sucesso. Cliente interessado nos serviços.' },
  { id: 2, tipo: 'whatsapp', data: '10/05/2026 · 14h30', nota: 'Enviada proposta comercial via WhatsApp.' },
  { id: 3, tipo: 'email',    data: '08/05/2026 · 09h15', nota: 'Primeiro contacto por email após prospecção no LinkedIn.' },
]

const LABELS_STATUS = {
  novo: 'Novo', contacto: 'Contacto Inicial', qualificado: 'Qualificado',
  negociacao: 'Negociação', progresso: 'Em Progresso', fechado: 'Fechado',
}

const TIPO_ICON = {
  whatsapp: 'bi-whatsapp',
  ligação:  'bi-telephone-fill',
  reunião:  'bi-camera-video-fill',
  email:    'bi-envelope-fill',
}

export default function FichaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente] = useState(MOCK_CLIENTE)
  const [interacoes, setInteracoes] = useState(MOCK_INTERACOES)
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'whatsapp', nota: '' })
  const [adicionando, setAdicionando] = useState(false)

  const handleAdicionarInteracao = (e) => {
    e.preventDefault()
    if (!novaInteracao.nota.trim()) return
    const agora = new Date().toLocaleDateString('pt-AO') + ' · ' +
      new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    setInteracoes(prev => [{
      id: Date.now(),
      tipo: novaInteracao.tipo,
      data: agora,
      nota: novaInteracao.nota
    }, ...prev])
    setNovaInteracao({ tipo: 'whatsapp', nota: '' })
    setAdicionando(false)
  }

  const formatKz = (v) => Number(v).toLocaleString('pt-AO') + ' Kz'

  return (
    <div className="ficha-page">

      {/* Breadcrumb / volta */}
      <div className="ficha-breadcrumb">
        <button onClick={() => navigate('/pipeline')} className="btn-voltar">
          <i className="bi bi-arrow-left"></i> Pipeline
        </button>
        <span className="breadcrumb-sep">/</span>
        <span>{cliente.empresa}</span>
      </div>

      {/* Cabeçalho da ficha */}
      <div className="ficha-header">
        <div className="ficha-header-left">
          <h1>{cliente.empresa}</h1>
          <div className="ficha-meta">
            <span className={`badge ${cliente.status}`}>{LABELS_STATUS[cliente.status]}</span>
            <span className="ficha-nicho">{cliente.nicho}</span>
            <span className="ficha-prioridade">Prioridade: <strong>{cliente.prioridade}</strong></span>
          </div>
        </div>
        <div className="ficha-header-actions">
          <button
            className="btn-wpp"
            onClick={() => window.open(`https://wa.me/244${cliente.whatsapp}`, '_blank')}
          >
            <i className="bi bi-whatsapp"></i> WhatsApp
          </button>
          <button className="btn-editar-ficha" onClick={() => navigate('/pipeline')}>
            <i className="bi bi-pencil-square"></i> Editar
          </button>
        </div>
      </div>

      {/* Corpo: 2 colunas */}
      <div className="ficha-body">

        {/* Coluna esquerda — Dados */}
        <div className="ficha-col">

          {/* Card dados */}
          <div className="ficha-card">
            <h2 className="ficha-card-titulo">
              <i className="bi bi-info-circle-fill"></i> Dados do Cliente
            </h2>
            <div className="ficha-dados-grid">
              <div className="ficha-dado">
                <span className="dado-label">Valor Estimado</span>
                <span className="dado-valor accent">{formatKz(cliente.valor)}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Vendedor</span>
                <span className="dado-valor">{cliente.vendedor}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Telefone</span>
                <span className="dado-valor">{cliente.telefone}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">E-mail</span>
                <span className="dado-valor">{cliente.email}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Último Contacto</span>
                <span className="dado-valor">{cliente.ultimoContacto}</span>
              </div>
              <div className="ficha-dado">
                <span className="dado-label">Fecho Previsto</span>
                <span className="dado-valor">{cliente.fechoPrevisto}</span>
              </div>
            </div>

            {cliente.linkInfo && (
              <a href={cliente.linkInfo} target="_blank" rel="noreferrer" className="btn-link-info">
                <i className="bi bi-box-arrow-up-right"></i> Ver informações externas
              </a>
            )}
          </div>

          {/* Card observações */}
          <div className="ficha-card">
            <h2 className="ficha-card-titulo">
              <i className="bi bi-sticky-fill"></i> Observações
            </h2>
            <p className="ficha-obs">
              {cliente.observacoes || 'Sem observações registadas.'}
            </p>
          </div>

        </div>

        {/* Coluna direita — Histórico */}
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

            {/* Formulário nova interacção */}
            {adicionando && (
              <form onSubmit={handleAdicionarInteracao} className="form-interacao">
                <div className="form-row-interacao">
                  <select
                    value={novaInteracao.tipo}
                    onChange={e => setNovaInteracao(n => ({...n, tipo: e.target.value}))}
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
                  onChange={e => setNovaInteracao(n => ({...n, nota: e.target.value}))}
                  required
                />
                <div className="form-interacao-acoes">
                  <button type="button" className="btn-cancelar-modal" onClick={() => setAdicionando(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar-modal">Guardar</button>
                </div>
              </form>
            )}

            {/* Lista */}
            <div className="interacoes-list">
              {interacoes.map(inter => (
                <div key={inter.id} className="interacao-item">
                  <div className="interacao-icon">
                    <i className={`bi ${TIPO_ICON[inter.tipo] || 'bi-chat-fill'}`}></i>
                  </div>
                  <div className="interacao-corpo">
                    <div className="interacao-meta">
                      <span className="interacao-tipo">{inter.tipo}</span>
                      <span className="interacao-data">{inter.data}</span>
                    </div>
                    <p className="interacao-nota">{inter.nota}</p>
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
