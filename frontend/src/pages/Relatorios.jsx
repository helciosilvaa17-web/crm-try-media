// frontend/src/pages/Relatorios.jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './Relatorios.css'

// Meses disponíveis para filtrar — mostramos os últimos 6 meses
// e os próximos 2 para planeamento
function gerarOpcoesMeses() {
  const opcoes = []
  const hoje = new Date()
  
  // Vamos 5 meses para trás e 2 para a frente
  for (let i = -5; i <= 2; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
    opcoes.push({
      label: data.toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' }),
      mes: data.getMonth() + 1,   // getMonth() começa em 0, a API quer 1-12
      ano: data.getFullYear()
    })
  }
  
  return opcoes
}

const OPCOES_MESES = gerarOpcoesMeses()

// Labels legíveis para os status da BD
const LABELS_FASE = {
  novo:        'Novo',
  contacto:    'Contacto Inicial',
  qualificado: 'Qualificado',
  negociacao:  'Negociação',
  progresso:   'Em Progresso',
  fechado:     'Fechado',
}

function fmt(v) {
  return Number(v || 0).toLocaleString('pt-AO') + ' Kz'
}

export default function Relatorios() {
  const hoje = new Date()
  
  // Estado do filtro — começa no mês actual
  const [mesSelecionado, setMesSelecionado] = useState({
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear()
  })
  
  // Dados vindos da API
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  // Este useEffect corre sempre que o mês seleccionado muda
  // É por isso que mesSelecionado está nas dependências
  useEffect(() => {
    async function carregarRelatorio() {
      try {
        setLoading(true)
        setErro(null)
        
        // Enviamos mes e ano como query params
        // Ex: GET /api/relatorios?mes=5&ano=2026
        const dados = await api.get(
          `/relatorios?mes=${mesSelecionado.mes}&ano=${mesSelecionado.ano}`
        )
        
        setDados(dados)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    carregarRelatorio()
  }, [mesSelecionado.mes, mesSelecionado.ano])
  // Nota: colocamos .mes e .ano em vez do objecto inteiro
  // porque se colocássemos o objecto, o React compararia a referência
  // (que é sempre diferente) e entraria em loop infinito

  // Handler do selector de mês
  // Recebe o índice do array OPCOES_MESES
  const handleMudarMes = (e) => {
    const opcao = OPCOES_MESES[e.target.value]
    setMesSelecionado({ mes: opcao.mes, ano: opcao.ano })
  }

  // Encontramos o índice da opção actual para o valor do select
  const indiceActual = OPCOES_MESES.findIndex(
    o => o.mes === mesSelecionado.mes && o.ano === mesSelecionado.ano
  )

  if (loading) {
    return (
      <div className="relatorios-page">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: 32, display: 'block', marginBottom: 12 }}></i>
          A carregar relatório...
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="relatorios-page">
        <div style={{ textAlign: 'center', padding: 80, color: '#e74c3c' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: 32, display: 'block', marginBottom: 12 }}></i>
          Erro: {erro}
        </div>
      </div>
    )
  }

  if (!dados) return null

  const pct = dados.meta > 0
    ? Math.min((dados.faturamento / dados.meta) * 100, 100).toFixed(2)
    : 0

  const maxVal = dados.pipeline.length > 0
    ? Math.max(...dados.pipeline.map(p => Number(p.valor)))
    : 1

  return (
    <div className="relatorios-page">

      <div className="rel-header">
        <h1>Relatórios</h1>

        {/* Selector de mês — agora funcional */}
        <select
          className="sel-mes"
          value={indiceActual}
          onChange={handleMudarMes}
        >
          {OPCOES_MESES.map((opcao, i) => (
            <option key={i} value={i}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs principais */}
      <div className="rel-kpis">
        <div className="rel-kpi">
          <span className="rel-kpi-label">Faturamento Total</span>
          <span className="rel-kpi-valor">{fmt(dados.faturamento)}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Meta Mensal</span>
          <span className="rel-kpi-valor muted">{fmt(dados.meta)}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">% da Meta Atingida</span>
          <span className="rel-kpi-valor accent">{pct}%</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Total de Leads</span>
          <span className="rel-kpi-valor">{dados.metricas.totalLeads}</span>
        </div>
        <div className="rel-kpi">
          <span className="rel-kpi-label">Reuniões Agendadas</span>
          <span className="rel-kpi-valor">{dados.metricas.reunioesAgendadas}</span>
        </div>
      </div>

      <div className="rel-row">

        {/* Pipeline por fase */}
        <div className="rel-card">
          <h2 className="rel-card-titulo">
            <i className="bi bi-funnel-fill"></i> Pipeline por Fase
          </h2>

          {dados.pipeline.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>
              Sem dados para este período.
            </p>
          ) : (
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th>Fase</th>
                  <th>Qtd</th>
                  <th>Valor Total</th>
                  <th>Barra</th>
                </tr>
              </thead>
              <tbody>
                {dados.pipeline.map(p => (
                  <tr key={p.fase}>
                    <td>
                      {/* Usamos a label legível se existir, senão o valor da BD */}
                      <span className={`badge ${p.fase}`}>
                        {LABELS_FASE[p.fase] || p.fase}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.qtd}</td>
                    <td style={{ color: 'var(--accent)' }}>{fmt(p.valor)}</td>
                    <td style={{ width: '30%' }}>
                      <div className="mini-barra-bg">
                        <div
                          className="mini-barra"
                          style={{ width: `${(Number(p.valor) / maxVal) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Barra de progresso da meta */}
        <div className="rel-card">
          <h2 className="rel-card-titulo">
            <i className="bi bi-bullseye"></i> Progresso da Meta
          </h2>
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Realizado</span>
              <span style={{ fontWeight: 700 }}>{fmt(dados.faturamento)}</span>
            </div>
            <div className="meta-barra-bg" style={{ height: 12, borderRadius: 6, background: 'var(--border)', overflow: 'hidden' }}>
              <div
                className="meta-barra"
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: Number(pct) >= 100 ? '#27ae60' : 'var(--accent)',
                  borderRadius: 6,
                  transition: 'width 0.6s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>
                {pct}%
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Meta: {fmt(dados.meta)}
              </span>
            </div>
          </div>

          {/* Resumo de métricas */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
              Resumo do Período
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14 }}>Leads criados</span>
                <strong>{dados.metricas.totalLeads}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14 }}>Reuniões agendadas</span>
                <strong>{dados.metricas.reunioesAgendadas}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14 }}>Clientes fechados</span>
                <strong>
                  {dados.pipeline.find(p => p.fase === 'fechado')?.qtd || 0}
                </strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}