// ============================================================
// RELATORIOS.JSX
// ============================================================
import { useState } from 'react'
import './Relatorios.css'

const MOCK = {
  faturamento: 230000,
  meta: 2325000,
  pipeline: [
    { fase: 'Contacto Inicial', qtd: 3, valor: 450000 },
    { fase: 'Qualificado',      qtd: 2, valor: 300000 },
    { fase: 'Negociação',       qtd: 1, valor: 250000 },
    { fase: 'Em Progresso',     qtd: 1, valor: 500000 },
    { fase: 'Fechado',          qtd: 2, valor: 230000 },
  ],
  taxas: {
    conexao:     60.68,
    agendamento: 30.40,
    fechamento:  40.00,
  },
  metricas: {
    totalLeads: 9,
    prospectados: 7,
    reunioesAgendadas: 5,
  }
}

const MESES_OPCOES = ['Janeiro 2026','Fevereiro 2026','Março 2026','Abril 2026','Maio 2026','Junho 2026']

function fmt(v) { return Number(v).toLocaleString('pt-AO') + ' Kz' }

export default function Relatorios() {
  const [mes, setMes] = useState('Maio 2026')
  const [d] = useState(MOCK)
  const pct = Math.min((d.faturamento / d.meta) * 100, 100).toFixed(2)
  const maxVal = Math.max(...d.pipeline.map(p => p.valor))

  return (
    <div className="relatorios-page">
      <div className="rel-header">
        <h1>Relatórios</h1>
        <select className="sel-mes" value={mes} onChange={e => setMes(e.target.value)}>
          {MESES_OPCOES.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* KPI topo */}
      <div className="rel-kpis">
        <div className="rel-kpi">
          <span className="rel-kpi-label">Faturamento Total</span>
          <span className="rel-kpi-valor">{fmt(d.faturamento)}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Meta Mensal</span>
          <span className="rel-kpi-valor muted">{fmt(d.meta)}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">% da Meta Atingida</span>
          <span className="rel-kpi-valor accent">{pct}%</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Total de Leads</span>
          <span className="rel-kpi-valor">{d.metricas.totalLeads}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Prospectados</span>
          <span className="rel-kpi-valor">{d.metricas.prospectados}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Reuniões Agendadas</span>
          <span className="rel-kpi-valor">{d.metricas.reunioesAgendadas}</span>
        </div>
      </div>

      <div className="rel-row">
        {/* Pipeline por fase */}
        <div className="rel-card">
          <h2 className="rel-card-titulo"><i className="bi bi-funnel-fill"></i> Pipeline por Fase</h2>
          <table className="rel-tabela">
            <thead>
              <tr><th>Fase</th><th>Qtd</th><th>Valor Total</th><th>Barra</th></tr>
            </thead>
            <tbody>
              {d.pipeline.map(p => (
                <tr key={p.fase}>
                  <td>{p.fase}</td>
                  <td style={{ fontWeight:700 }}>{p.qtd}</td>
                  <td style={{ color:'var(--accent)' }}>{fmt(p.valor)}</td>
                  <td style={{ width:'30%' }}>
                    <div className="mini-barra-bg">
                      <div className="mini-barra" style={{ width:`${(p.valor/maxVal)*100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Taxas de conversão */}
        <div className="rel-card">
          <h2 className="rel-card-titulo"><i className="bi bi-graph-up-arrow"></i> Taxas de Conversão</h2>
          <div className="taxas-list">
            {Object.entries({ 'Tx. Conexão': d.taxas.conexao, 'Tx. Agendamento': d.taxas.agendamento, 'Tx. Fechamento': d.taxas.fechamento }).map(([label, val]) => (
              <div key={label} className="taxa-item">
                <div className="taxa-info">
                  <span>{label}</span>
                  <span className="taxa-val">{val}%</span>
                </div>
                <div className="meta-barra-bg">
                  <div className="taxa-barra" style={{ width:`${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
