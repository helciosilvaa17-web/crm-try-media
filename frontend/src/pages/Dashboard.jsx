// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'  // ← importamos o nosso utilitário
import './Dashboard.css'

function formatKz(valor) {
  return Number(valor).toLocaleString('pt-AO') + ' Kz'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Estado para os dados — começa vazio (null = ainda não carregou)
  const [dados, setDados] = useState(null)
  
  // Estado para saber se está a carregar
  // começa true porque mal o componente abre, já está a carregar
  const [loading, setLoading] = useState(true)
  
  // Estado para guardar mensagem de erro, se houver
  const [erro, setErro] = useState(null)

  // useEffect com array vazio = corre uma única vez quando o componente monta
  useEffect(() => {
    
    // Definimos uma função async dentro do useEffect
    // porque o callback do useEffect em si não pode ser async
    async function carregarDashboard() {
      try {
        setLoading(true)
        setErro(null)
        
        // api.get('/dashboard') chama GET http://localhost:3001/api/dashboard
        // com o token JWT no header automaticamente
        const dados = await api.get('/dashboard')
        
        setDados(dados)
      } catch (err) {
        // Se houve erro (rede, token expirado, servidor em baixo),
        // guardamos a mensagem para mostrar ao utilizador
        setErro(err.message)
      } finally {
        // finally corre SEMPRE — com sucesso ou com erro
        // Garante que paramos o loading mesmo se houver erro
        setLoading(false)
      }
    }
    
    carregarDashboard()
  }, [])  // [] = sem dependências, corre só uma vez

  // Enquanto carrega, mostramos um indicador
  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: 32, display: 'block', marginBottom: 12 }}></i>
          A carregar dashboard...
        </div>
      </div>
    )
  }

  // Se houve erro, mostramos a mensagem
  if (erro) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '80px', color: '#e74c3c' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: 32, display: 'block', marginBottom: 12 }}></i>
          Erro: {erro}
        </div>
      </div>
    )
  }

  // Se dados ainda for null (improvável mas seguro), não renderizamos
  if (!dados) return null

  // A API devolve: { kpis, contactarHoje, funil, meta, reunioes }
  // O backend usa campos como: totalLeads, fechados, emNegociacao, valorPipeline
  // A meta tem: realizado e total (meta.meta_faturamento)
  
  const percentMeta = dados.meta.total > 0
    ? Math.min((dados.meta.realizado / dados.meta.total) * 100, 100).toFixed(1)
    : 0

  // O funil da API devolve: [{ status: 'novo', qtd: 3 }, ...]
  // Precisamos de mapear 'status' para 'fase' e adicionar a classe CSS
  const labelsFunil = {
    novo:        'Novo',
    contacto:    'Contacto Inicial',
    qualificado: 'Qualificado',
    negociacao:  'Negociação',
    progresso:   'Em Progresso',
    fechado:     'Fechado',
  }

  // Calculamos o máximo para as barras proporcionais do funil
  const maxFunil = dados.funil.length > 0
    ? Math.max(...dados.funil.map(f => f.qtd))
    : 1

  return (
    <div className="dashboard">

      <div className="dash-header">
        <h1>Dashboard</h1>
        <p className="dash-sub">
          Bem-vindo, <strong>{user?.nome?.split(' ')[0]}</strong> ☀️
        </p>
      </div>

      {/* KPI Cards — dados reais da API */}
      <div className="dash-kpis">
        <div className="kpi-card">
          <i className="bi bi-people-fill kpi-icon blue"></i>
          <div>
            <span className="kpi-valor">{dados.kpis.totalLeads}</span>
            <span className="kpi-label">Total de Leads</span>
          </div>
        </div>
        <div className="kpi-card">
          <i className="bi bi-check-circle-fill kpi-icon green"></i>
          <div>
            <span className="kpi-valor">{dados.kpis.fechados}</span>
            <span className="kpi-label">Fechados este mês</span>
          </div>
        </div>
        <div className="kpi-card">
          <i className="bi bi-arrow-repeat kpi-icon yellow"></i>
          <div>
            <span className="kpi-valor">{dados.kpis.emNegociacao}</span>
            <span className="kpi-label">Em Negociação</span>
          </div>
        </div>
        <div className="kpi-card">
          <i className="bi bi-cash-stack kpi-icon purple"></i>
          <div>
            <span className="kpi-valor">{formatKz(dados.kpis.valorPipeline)}</span>
            <span className="kpi-label">Valor Pipeline</span>
          </div>
        </div>
      </div>

      {/* Alerta de clientes para contactar */}
      {dados.contactarHoje.length > 0 && (
        <div className="dash-alerta">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>
            <strong>{dados.contactarHoje.length} cliente(s) para contactar HOJE</strong>
            {' → '}
            {dados.contactarHoje.map((c, i) => (
              <span key={c.id}>
                <button
                  className="alerta-link"
                  onClick={() => navigate(`/cliente/${c.id}`)}
                >
                  {c.empresa}
                </button>
                {i < dados.contactarHoje.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="dash-row">

        {/* Funil de Vendas */}
        <div className="dash-card funil-card">
          <h2 className="card-titulo">
            <i className="bi bi-funnel-fill"></i> Funil de Vendas
          </h2>
          <div className="funil-list">
            {dados.funil.map(f => (
              <div key={f.status} className="funil-item">
                <div className="funil-info">
                  <span className={`badge ${f.status}`}>
                    {labelsFunil[f.status] || f.status}
                  </span>
                  <span className="funil-qtd">{f.qtd}</span>
                </div>
                <div className="funil-barra-bg">
                  <div
                    className={`funil-barra ${f.status}`}
                    style={{ width: `${(f.qtd / maxFunil) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Mensal */}
        <div className="dash-card meta-card">
          <h2 className="card-titulo">
            <i className="bi bi-bullseye"></i> Meta Mensal
          </h2>
          <div className="meta-valores">
            <div className="meta-item">
              <span className="meta-num">{formatKz(dados.meta.realizado)}</span>
              <span className="meta-desc">Realizado</span>
            </div>
            <div className="meta-separador">/</div>
            <div className="meta-item">
              <span className="meta-num">{formatKz(dados.meta.total)}</span>
              <span className="meta-desc">Meta</span>
            </div>
          </div>
          <div className="meta-barra-bg">
            <div className="meta-barra" style={{ width: `${percentMeta}%` }} />
          </div>
          <span className="meta-percent">{percentMeta}% atingido</span>
        </div>

        {/* Próximas Reuniões */}
        <div className="dash-card reunioes-card">
          <h2 className="card-titulo">
            <i className="bi bi-calendar-event-fill"></i> Próximas Reuniões
          </h2>
          <div className="reunioes-list">
            {dados.reunioes.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Sem reuniões agendadas.
              </p>
            )}
            {dados.reunioes.map(r => (
              <div key={r.id} className="reuniao-item">
                <div className="reuniao-info">
                  <span className="reuniao-titulo">{r.titulo}</span>
                  <span className="reuniao-cliente">{r.cliente || '—'}</span>
                </div>
                <div className="reuniao-direita">
                  <span className="reuniao-data">
                    {new Date(r.data_hora).toLocaleDateString('pt-AO', {
                      day: '2-digit', month: 'short'
                    })} · {new Date(r.data_hora).toLocaleTimeString('pt-AO', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className="reuniao-tipo">{r.tipo}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-ver-todas" onClick={() => navigate('/reunioes')}>
            Ver todas as reuniões <i className="bi bi-arrow-right"></i>
          </button>
        </div>

      </div>
    </div>
  )
}