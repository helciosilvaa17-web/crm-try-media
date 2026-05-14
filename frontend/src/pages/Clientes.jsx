import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const FORM_DEAL_VAZIO = {
  descricao: '', cliente_nome: '', servico: '',
  valor: '', data_deal: '', notas: ''
}

function fmt(v) { return Number(v || 0).toLocaleString('pt-AO') + ' Kz' }

export default function Clientes() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [fechados, setFechados]       = useState([])
  const [deals, setDeals]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]               = useState(FORM_DEAL_VAZIO)
  const [guardando, setGuardando]     = useState(false)
  const [confirmarId, setConfirmarId] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const [dadosFechados, dadosDeals] = await Promise.all([
          api.get('/clientes?status=fechado'),
          api.get('/deals')
        ])
        setFechados(dadosFechados)
        setDeals(dadosDeals)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const totalPipeline = fechados.reduce((s, c) => s + Number(c.valor_estimado || 0), 0)
  const totalDeals    = deals.reduce((s, d) => s + Number(d.valor || 0), 0)
  const totalGeral    = totalPipeline + totalDeals

  const handleCriarDeal = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/deals', form)
      const novosDeals = await api.get('/deals')
      setDeals(novosDeals)
      setModalAberto(false)
      setForm(FORM_DEAL_VAZIO)
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleApagarDeal = async (id) => {
    try {
      await api.delete(`/deals/${id}`)
      setDeals(d => d.filter(x => x.id !== id))
      setConfirmarId(null)
    } catch (err) {
      alert('Erro: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        A carregar...
      </div>
    )
  }

  return (
    <div className="pipeline-page">

      {/* Header */}
      <div className="pipeline-header">
        <h1>Clientes</h1>
        <button className="btn-novo" onClick={() => setModalAberto(true)}>
          + Novo Negócio
        </button>
      </div>

      {/* Totais */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="kpi-card" style={{ flex: 1, minWidth: 180 }}>
          <div>
            <span className="kpi-valor" style={{ fontSize: 20 }}>{fmt(totalGeral)}</span>
            <span className="kpi-label">Total Faturado</span>
          </div>
        </div>
        <div className="kpi-card" style={{ flex: 1, minWidth: 180 }}>
          <div>
            <span className="kpi-valor" style={{ fontSize: 20 }}>{fechados.length}</span>
            <span className="kpi-label">Clientes Fechados</span>
          </div>
        </div>
        <div className="kpi-card" style={{ flex: 1, minWidth: 180 }}>
          <div>
            <span className="kpi-valor" style={{ fontSize: 20 }}>{deals.length}</span>
            <span className="kpi-label">Negócios Avulso</span>
          </div>
        </div>
      </div>

      {/* ── Clientes fechados do pipeline ──────────────────────── */}
      <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-muted)' }}>
        <i className="bi bi-funnel-fill"></i> Do Pipeline
      </h2>

      {fechados.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Nenhum lead fechado ainda.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
          {fechados.map(c => (
            <div key={c.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20,
              borderTop: '3px solid #27ae60'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{c.nome_empresa}</span>
                <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 15 }}>
                  {fmt(c.valor_estimado)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                {c.nicho} · {c.vendedor_nome || 'Sem vendedor'}
              </div>
              {c.ultimo_contacto && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Fechado em: {new Date(c.ultimo_contacto).toLocaleDateString('pt-AO')}
                </div>
              )}
              <button
                onClick={() => navigate(`/cliente/${c.id}`)}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: 'var(--text)', fontSize: 13, width: '100%'
                }}
              >
                Ver ficha completa
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Negócios avulso ──────────────────────────────────────── */}
      <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-muted)' }}>
        <i className="bi bi-lightning-fill"></i> Negócios Avulso
      </h2>

      {deals.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          Nenhum negócio avulso registado.{' '}
          <button
            onClick={() => setModalAberto(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Adicionar agora
          </button>
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {deals.map(d => (
            <div key={d.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20,
              borderTop: '3px solid var(--accent)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{d.cliente_nome}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}>
                  {fmt(d.valor)}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{d.descricao}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                Serviço: {d.servico}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                {new Date(d.data_deal).toLocaleDateString('pt-AO')} · {d.vendedor_nome || 'Sem vendedor'}
              </div>
              {d.notas && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
                  {d.notas}
                </p>
              )}
              <button
                onClick={() => setConfirmarId(d.id)}
                style={{
                  background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: '#ff8a8a', fontSize: 13, width: '100%'
                }}
              >
                <i className="bi bi-trash"></i> Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo deal */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Negócio</h2>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCriarDeal} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente / Empresa *</label>
                  <input required value={form.cliente_nome}
                    onChange={e => setForm(f => ({ ...f, cliente_nome: e.target.value }))}
                    placeholder="Nome da empresa" />
                </div>
                <div className="form-group">
                  <label>Serviço *</label>
                  <input required value={form.servico}
                    onChange={e => setForm(f => ({ ...f, servico: e.target.value }))}
                    placeholder="Ex: Gravação de vídeo" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Descrição *</label>
                  <input required value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    placeholder="Descreve o negócio" />
                </div>
                <div className="form-group">
                  <label>Valor (Kz) *</label>
                  <input required type="number" value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Data do Negócio *</label>
                <input required type="date" value={form.data_deal}
                  onChange={e => setForm(f => ({ ...f, data_deal: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea rows={3} value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Observações..." />
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn-cancelar-modal" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar-modal" disabled={guardando}>
                  {guardando ? 'A guardar...' : 'Adicionar Negócio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação apagar deal */}
      {confirmarId && (
        <div className="modal-overlay" onClick={() => setConfirmarId(null)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <h2>Remover negócio?</h2>
            <p>Esta acção não pode ser revertida.</p>
            <div className="modal-acoes">
              <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>
                Cancelar
              </button>
              <button className="btn-apagar-confirm" onClick={() => handleApagarDeal(confirmarId)}>
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}