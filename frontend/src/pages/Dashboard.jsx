import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

// Dados mock para desenvolvimento — substituir por fetch à API
const MOCK = {
  kpis: {
    totalLeads: 7,
    fechados: 2,
    emNegociacao: 3,
    valorPipeline: 1150000
  },
  contactarHoje: [
    { id: 1, empresa: 'Grupo Alpha', nicho: 'Marketing', telefone: '923000001' },
    { id: 2, empresa: 'MediaX',      nicho: 'Audiovisual', telefone: '923000002' }
  ],
  funil: [
    { fase: 'Novo',             qtd: 1, classe: 'novo'       },
    { fase: 'Contacto Inicial', qtd: 3, classe: 'contacto'   },
    { fase: 'Qualificado',      qtd: 2, classe: 'qualificado'},
    { fase: 'Negociação',       qtd: 1, classe: 'negociacao' },
    { fase: 'Em Progresso',     qtd: 1, classe: 'progresso'  },
    { fase: 'Fechado',          qtd: 2, classe: 'fechado'    },
  ],
  meta: {
    realizado: 230000,
    total: 2325000
  },
  reunioes: [
    { id: 1, titulo: 'Reunião Grupo Alpha', cliente: 'Grupo Alpha', data: '25 Mai · 12h00', tipo: 'Diagnóstico' },
    { id: 2, titulo: 'Follow-up MediaX',    cliente: 'MediaX',      data: '28 Mai · 09h30', tipo: 'Follow-up'   }
  ]
}

function formatKz(valor) {
  return valor.toLocaleString('pt-AO') + ' Kz'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState(MOCK)

  // Quando o backend estiver pronto, descomenta:
  // useEffect(() => {
  //   fetch('/api/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('crm_token')}` }})
  //     .then(r => r.json()).then(setDados)
  // }, [])

  const percentMeta = Math.min((dados.meta.realizado / dados.meta.total) * 100, 100).toFixed(1)
  const maxFunil = Math.max(...dados.funil.map(f => f.qtd))

  return (
    <div className="dashboard">

      {/* Cabeçalho */}
      <div className="dash-header">
        <h1>Dashboard</h1>
        <p className="dash-sub">
          Bem-vindo, <strong>{user?.nome?.split(' ')[0]}</strong> ☀️
        </p>
      </div>

      {/* KPI Cards */}
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

      {/* Alerta contactar hoje */}
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

      {/* Linha 2 — Funil + Meta + Reuniões */}
      <div className="dash-row">

        {/* Funil de Vendas */}
        <div className="dash-card funil-card">
          <h2 className="card-titulo">
            <i className="bi bi-funnel-fill"></i> Funil de Vendas
          </h2>
          <div className="funil-list">
            {dados.funil.map(f => (
              <div key={f.fase} className="funil-item">
                <div className="funil-info">
                  <span className={`badge ${f.classe}`}>{f.fase}</span>
                  <span className="funil-qtd">{f.qtd}</span>
                </div>
                <div className="funil-barra-bg">
                  <div
                    className={`funil-barra ${f.classe}`}
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
              <span className="meta-num muted">{formatKz(dados.meta.total)}</span>
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
            {dados.reunioes.map(r => (
              <div key={r.id} className="reuniao-item">
                <div className="reuniao-info">
                  <span className="reuniao-titulo">{r.titulo}</span>
                  <span className="reuniao-cliente">{r.cliente}</span>
                </div>
                <div className="reuniao-direita">
                  <span className="reuniao-data">{r.data}</span>
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
