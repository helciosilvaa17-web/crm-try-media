import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './Relatorios.css'

function gerarOpcoesMeses() {
  const opcoes = []
  const hoje = new Date()
  for (let i = -5; i <= 2; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
    opcoes.push({
      label: data.toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' }),
      mes: data.getMonth() + 1,
      ano: data.getFullYear()
    })
  }
  return opcoes
}

const OPCOES_MESES = gerarOpcoesMeses()
const OPCAO_TODOS  = { label: 'Todos os dados', mes: null, ano: null }

const LABELS_FASE = {
  novo: 'Novo', contacto: 'Contacto Inicial', qualificado: 'Qualificado',
  negociacao: 'Negociação', progresso: 'Em Progresso', fechado: 'Fechado',
}

function fmt(v) { return Number(v || 0).toLocaleString('pt-AO') + ' Kz' }

function BarraProgresso({ valor, total, cor = 'var(--accent)' }) {
  const pct = total > 0 ? Math.min((valor / total) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 40 }}>{pct.toFixed(0)}%</span>
    </div>
  )
}

export default function Relatorios() {
  const [mesSelecionado, setMesSelecionado]     = useState(OPCAO_TODOS)
  const [vendedorSelecionado, setVendedorSelecionado] = useState(null)
  const [dadosGlobais, setDadosGlobais]         = useState(null)
  const [dadosVendedor, setDadosVendedor]       = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [erro, setErro]                         = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setErro(null)
        const params = mesSelecionado.mes
          ? `?mes=${mesSelecionado.mes}&ano=${mesSelecionado.ano}`
          : ''
        const dados = await api.get(`/relatorios${params}`)
        setDadosGlobais(dados)
        setVendedorSelecionado(null)
        setDadosVendedor(null)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [mesSelecionado.mes, mesSelecionado.ano])

  useEffect(() => {
    if (!vendedorSelecionado) return
    async function carregarVendedor() {
      try {
        setLoading(true)
        const params = mesSelecionado.mes
          ? `?mes=${mesSelecionado.mes}&ano=${mesSelecionado.ano}`
          : ''
        const dados = await api.get(`/relatorios/vendedor/${vendedorSelecionado}${params}`)
        setDadosVendedor(dados)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregarVendedor()
  }, [vendedorSelecionado, mesSelecionado.mes, mesSelecionado.ano])

  const handleMudarMes = (e) => {
    const val = e.target.value
    setMesSelecionado(val === 'todos' ? OPCAO_TODOS : OPCOES_MESES[Number(val)])
  }

  const valorSelect = mesSelecionado.mes === null
    ? 'todos'
    : OPCOES_MESES.findIndex(o => o.mes === mesSelecionado.mes && o.ano === mesSelecionado.ano)

  return (
    <div className="relatorios-page">

      <div className="rel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {vendedorSelecionado && (
            <button
              onClick={() => { setVendedorSelecionado(null); setDadosVendedor(null) }}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <i className="bi bi-arrow-left"></i> Equipa
            </button>
          )}
          <h1>
            {vendedorSelecionado && dadosVendedor
              ? dadosVendedor.vendedor.nome
              : 'Relatórios'}
          </h1>
        </div>

        <select className="sel-mes" value={valorSelect} onChange={handleMudarMes}>
          <option value="todos">Todos os dados</option>
          {OPCOES_MESES.map((opcao, i) => (
            <option key={i} value={i}>{opcao.label}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          A carregar...
        </div>
      )}

      {erro && (
        <div style={{ textAlign: 'center', padding: 80, color: '#e74c3c' }}>
          Erro: {erro}
        </div>
      )}

      {/* ── Vista Global ─────────────────────────────────────── */}
      {!loading && !erro && !vendedorSelecionado && dadosGlobais && (
        <>
          <div className="rel-kpis">
            <div className="rel-kpi">
              <span className="rel-kpi-label">Faturamento Total</span>
              <span className="rel-kpi-valor">{fmt(dadosGlobais.faturamento)}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Meta Mensal</span>
              <span className="rel-kpi-valor muted">{fmt(dadosGlobais.meta)}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">% da Meta</span>
              <span className="rel-kpi-valor accent">
                {dadosGlobais.meta > 0
                  ? Math.min((dadosGlobais.faturamento / dadosGlobais.meta) * 100, 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Leads criados</span>
              <span className="rel-kpi-valor">{dadosGlobais.metricas.totalLeads}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Reuniões agendadas</span>
              <span className="rel-kpi-valor">{dadosGlobais.metricas.reunioesAgendadas}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Reuniões realizadas</span>
              <span className="rel-kpi-valor">{dadosGlobais.metricas.reunioesRealizadas}</span>
            </div>
          </div>

          <div className="rel-row">
            <div className="rel-card" style={{ flex: 2 }}>
              <h2 className="rel-card-titulo">
                <i className="bi bi-people-fill"></i> Desempenho da Equipa
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Clica num vendedor para ver os detalhes individuais.
              </p>
              {dadosGlobais.vendedores.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                  Sem vendedores registados.
                </p>
              ) : (
                <table className="rel-tabela">
                  <thead>
                    <tr>
                      <th>Vendedor</th><th>Clientes</th><th>Reuniões</th>
                      <th>Fechados</th><th>Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosGlobais.vendedores.map(v => (
                      <tr key={v.id} onClick={() => setVendedorSelecionado(v.id)}
                        style={{ cursor: 'pointer' }} className="linha-clicavel">
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="bi bi-person-circle" style={{ fontSize: 18, opacity: 0.6 }}></i>
                            {v.nome}
                          </span>
                        </td>
                        <td>{v.total_clientes}</td>
                        <td>{v.reunioes_mes}</td>
                        <td>{v.fechados_mes}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          {fmt(v.faturamento_mes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="rel-card">
                <h2 className="rel-card-titulo">
                  <i className="bi bi-funnel-fill"></i> Pipeline
                </h2>
                {dadosGlobais.pipeline.map(p => (
                  <div key={p.fase} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className={`badge ${p.fase}`} style={{ fontSize: 12 }}>
                        {LABELS_FASE[p.fase] || p.fase}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{p.qtd}</span>
                    </div>
                    <BarraProgresso
                      valor={Number(p.valor)}
                      total={Math.max(...dadosGlobais.pipeline.map(x => Number(x.valor)))}
                    />
                  </div>
                ))}
              </div>

              {dadosGlobais.taxasEsperadas && (
                <div className="rel-card">
                  <h2 className="rel-card-titulo">
                    <i className="bi bi-graph-up-arrow"></i> Taxas Esperadas
                  </h2>
                  {[
                    { label: 'Conexão',     val: dadosGlobais.taxasEsperadas.taxa_conexao },
                    { label: 'Agendamento', val: dadosGlobais.taxasEsperadas.taxa_agendamento },
                    { label: 'Realização',  val: dadosGlobais.taxasEsperadas.taxa_realizacao },
                    { label: 'Fechamento',  val: dadosGlobais.taxasEsperadas.taxa_fechamento },
                  ].map(t => (
                    <div key={t.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{t.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{t.val}%</span>
                      </div>
                      <BarraProgresso valor={t.val} total={100} cor="#9b59b6" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Vista Vendedor ───────────────────────────────────── */}
      {!loading && !erro && vendedorSelecionado && dadosVendedor && (
        <>
          <div className="rel-kpis">
            <div className="rel-kpi">
              <span className="rel-kpi-label">Faturamento</span>
              <span className="rel-kpi-valor">{fmt(dadosVendedor.metricas.faturamentoMes)}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Clientes Totais</span>
              <span className="rel-kpi-valor">{dadosVendedor.metricas.totalClientes}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Fechados este mês</span>
              <span className="rel-kpi-valor">{dadosVendedor.metricas.fechadosMes}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Reuniões agendadas</span>
              <span className="rel-kpi-valor">{dadosVendedor.metricas.reunioesAgendadas}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Reuniões realizadas</span>
              <span className="rel-kpi-valor">{dadosVendedor.metricas.reunioesRealizadas}</span>
            </div>
            <div className="rel-kpi">
              <span className="rel-kpi-label">Meta de Reuniões</span>
              <span className="rel-kpi-valor muted">
                {dadosVendedor.metricas.reunioesAgendadas} / {dadosVendedor.metricas.metaReunioes || '—'}
              </span>
            </div>
          </div>

          <div className="rel-row">
            <div className="rel-card">
              <h2 className="rel-card-titulo">
                <i className="bi bi-funnel-fill"></i> Pipeline de {dadosVendedor.vendedor.nome}
              </h2>
              <table className="rel-tabela">
                <thead>
                  <tr><th>Fase</th><th>Qtd</th><th>Valor</th></tr>
                </thead>
                <tbody>
                  {dadosVendedor.pipeline.map(p => (
                    <tr key={p.fase}>
                      <td><span className={`badge ${p.fase}`}>{LABELS_FASE[p.fase] || p.fase}</span></td>
                      <td style={{ fontWeight: 700 }}>{p.qtd}</td>
                      <td style={{ color: 'var(--accent)' }}>{fmt(p.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rel-card">
              <h2 className="rel-card-titulo">
                <i className="bi bi-clock-history"></i> Últimas Interacções
              </h2>
              {dadosVendedor.ultimasInteracoes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sem interacções registadas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dadosVendedor.ultimasInteracoes.map((inter, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', background: 'var(--border)',
                      borderRadius: 8, fontSize: 13
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong>{inter.cliente}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {new Date(inter.data).toLocaleDateString('pt-AO')}
                        </span>
                      </div>
                      <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 4 }}>{inter.tipo}</div>
                      <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{inter.nota}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}