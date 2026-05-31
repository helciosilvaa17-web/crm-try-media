import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './Clientes.css'

const FORM_DEAL_VAZIO = {
    descricao: '', cliente_nome: '', servico: '',
    valor: '', data_deal: '', notas: ''
}

function fmt(v) { return Number(v || 0).toLocaleString('pt-AO') + ' Kz' }

export default function Clientes() {
    const navigate = useNavigate()

    const [fechados, setFechados] = useState([])
    const [deals, setDeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalAberto, setModalAberto] = useState(false)
    const [form, setForm] = useState(FORM_DEAL_VAZIO)
    const [guardando, setGuardando] = useState(false)
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
    const totalDeals = deals.reduce((s, d) => s + Number(d.valor || 0), 0)
    const totalGeral = totalPipeline + totalDeals

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
            <div className="clientes-page">
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                    A carregar...
                </div>
            </div>
        )
    }

    return (
        <div className="clientes-page">

            <div className="clientes-header">
                <h1>Clientes</h1>
                <button className="btn-novo" onClick={() => setModalAberto(true)}>
                    + Novo Negócio
                </button>
            </div>

            {/* Totais */}
            <div className="clientes-totais">
                <div className="kpi-card">
                    <div>
                        <span className="kpi-valor" style={{ fontSize: 20 }}>{fmt(totalGeral)}</span>
                        <span className="kpi-label">Total Faturado</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div>
                        <span className="kpi-valor" style={{ fontSize: 20 }}>{fechados.length}</span>
                        <span className="kpi-label">Clientes Fechados</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div>
                        <span className="kpi-valor" style={{ fontSize: 20 }}>{deals.length}</span>
                        <span className="kpi-label">Negócios Avulso</span>
                    </div>
                </div>
            </div>

            {/* ── Do Pipeline ─────────────────────────────────── */}
            <div className="clientes-secao-titulo">
                <i className="bi bi-funnel-fill"></i> Do Pipeline
            </div>

            {fechados.length === 0 ? (
                <p className="clientes-empty">Nenhum lead fechado ainda.</p>
            ) : (
                <div className="clientes-grid">
                    {fechados.map(c => (
                        <div key={c.id} className="deal-card pipeline">
                            <div className="deal-card-top">
                                <span className="deal-card-nome">{c.nome_empresa}</span>
                                <span className="deal-card-valor">{fmt(c.valor_estimado)}</span>
                            </div>
                            <div className="deal-card-meta">{c.nicho} · {c.vendedor_nome || 'Sem vendedor'}</div>
                            {c.ultimo_contacto && (
                                <div className="deal-card-data">
                                    Fechado em: {new Date(c.ultimo_contacto).toLocaleDateString('pt-AO')}
                                </div>
                            )}
                            <div className="deal-card-actions">
                                <button className="btn-ver-ficha" onClick={() => navigate(`/cliente/${c.id}`)}>
                                    Ver ficha completa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Negócios Avulso ─────────────────────────────── */}
            <div className="clientes-secao-titulo">
                <i className="bi bi-lightning-fill"></i> Negócios Avulso
            </div>

            {deals.length === 0 ? (
                <p className="clientes-empty">
                    Nenhum negócio avulso registado.{' '}
                    <button onClick={() => setModalAberto(true)}>Adicionar agora</button>
                </p>
            ) : (
                <div className="clientes-grid">
                    {deals.map(d => (
                        <div key={d.id} className="deal-card avulso">
                            <div className="deal-card-top">
                                <span className="deal-card-nome">{d.cliente_nome}</span>
                                <span className="deal-card-valor">{fmt(d.valor)}</span>
                            </div>
                            <div className="deal-card-desc">{d.descricao}</div>
                            <div className="deal-card-meta">Serviço: {d.servico}</div>
                            <div className="deal-card-data">
                                {new Date(d.data_deal).toLocaleDateString('pt-AO')} · {d.vendedor_nome || 'Sem vendedor'}
                            </div>
                            {d.notas && <p className="deal-card-notas">{d.notas}</p>}
                            <div className="deal-card-actions">
                                <button className="btn-remover-deal" onClick={() => setConfirmarId(d.id)}>
                                    <i className="bi bi-trash"></i> Remover
                                </button>
                            </div>
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

            {/* Confirmação apagar */}
            {confirmarId && (
                <div className="modal-overlay" onClick={() => setConfirmarId(null)}>
                    <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
                        <h2>Remover negócio?</h2>
                        <p>Esta acção não pode ser revertida.</p>
                        <div className="modal-acoes">
                            <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>Cancelar</button>
                            <button className="btn-apagar-confirm" onClick={() => handleApagarDeal(confirmarId)}>Sim, remover</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}