// frontend/src/pages/Reunioes.jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './Reunioes.css'

// ─── Constantes ───────────────────────────────────────────────

const TIPOS = ['diagnóstico', 'follow-up', 'proposta', 'reunião interna', 'outro']

const FORMATOS = ['online', 'presencial']

// Estados com as cores que pediste
const ESTADOS = [
  { valor: 'agendado',           label: 'Agendado',            cor: '#3498db' },
  { valor: 'por confirmacao',    label: 'Por Confirmação',     cor: '#f39c12' },
  { valor: 'sem comparecimento', label: 'Sem Comparecimento',  cor: '#e67e22' },
  { valor: 'remarcado',          label: 'Remarcado',           cor: '#9b59b6' },
  { valor: 'cancelado',          label: 'Cancelado',           cor: '#e74c3c' },
  { valor: 'realizada',          label: 'Realizada',           cor: '#27ae60' },
]

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

const FORM_VAZIO = {
  titulo: '', cliente: '', data_hora: '', tipo: 'diagnóstico',
  notas: '', canal: '', responsavel_empresa: '',
  estado: 'agendado', formato: 'online', responsavel_trymedia: ''
}

// ─── Funções auxiliares ───────────────────────────────────────

function formatDataHora(str) {
  const d = new Date(str)
  return d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
}

function diasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1)
  const ultimo   = new Date(ano, mes + 1, 0)
  let inicioSemana = (primeiro.getDay() + 6) % 7
  const dias = []
  for (let i = 0; i < inicioSemana; i++) dias.push(null)
  for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d)
  return dias
}

function getCorEstado(valor) {
  return ESTADOS.find(e => e.valor === valor)?.cor || '#888'
}

function getLabelEstado(valor) {
  return ESTADOS.find(e => e.valor === valor)?.label || valor
}

// ─── Componente ───────────────────────────────────────────────

export default function Reunioes() {
  const [vista, setVista] = useState('lista')
  const [reunioes, setReunioes] = useState([])
  const [utilizadores, setUtilizadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const hoje = new Date()
  const [calMes, setCalMes] = useState(hoje.getMonth())
  const [calAno, setCalAno] = useState(hoje.getFullYear())

  // Dia seleccionado no calendário — começa no dia de hoje
  const [diaSelecionado, setDiaSelecionado] = useState(hoje.getDate())

  // ─── Carregar dados ──────────────────────────────────────────

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)

        // Carregamos reuniões e utilizadores em paralelo
        // Promise.all espera que AMBOS terminem antes de continuar
        // É mais rápido do que esperar um de cada vez
        const [dadosReunioes, dadosUtilizadores] = await Promise.all([
          api.get('/reunioes'),
          api.get('/reunioes/utilizadores')
        ])

        setReunioes(dadosReunioes)
        setUtilizadores(dadosUtilizadores)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  // ─── Modal ───────────────────────────────────────────────────

  const abrirModal = (r = null) => {
    if (r) {
      setForm({
        titulo:               r.titulo || '',
        cliente:              r.cliente_nome || '',
        data_hora:            r.data_hora ? r.data_hora.slice(0, 16) : '',
        tipo:                 r.tipo || 'diagnóstico',
        notas:                r.notas || '',
        canal:                r.canal || '',
        responsavel_empresa:  r.responsavel_empresa || '',
        estado:               r.estado || 'agendado',
        formato:              r.formato || 'online',
        responsavel_trymedia: r.responsavel_trymedia || '',
      })
      setEditandoId(r.id)
    } else {
      setForm(FORM_VAZIO)
      setEditandoId(null)
    }
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setForm(FORM_VAZIO)
    setEditandoId(null)
  }

  // ─── Guardar ─────────────────────────────────────────────────

  const handleGuardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editandoId) {
        await api.put(`/reunioes/${editandoId}`, form)
        // Actualiza localmente sem ir buscar tudo de novo
        setReunioes(r => r.map(m =>
          m.id === editandoId ? { ...m, ...form } : m
        ))
      } else {
        const resultado = await api.post('/reunioes', form)
        // Vai buscar a reunião criada para ter os campos gerados pelo servidor
        const novasReunioes = await api.get('/reunioes')
        setReunioes(novasReunioes)
      }
      fecharModal()
    } catch (err) {
      alert('Erro ao guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  // ─── Apagar ──────────────────────────────────────────────────

  const handleApagar = async (id) => {
    if (!window.confirm('Apagar esta reunião?')) return
    try {
      await api.delete(`/reunioes/${id}`)
      setReunioes(r => r.filter(m => m.id !== id))
    } catch (err) {
      alert('Erro ao apagar: ' + err.message)
    }
  }

  // ─── Calendário ──────────────────────────────────────────────

  const reunioesMes = reunioes.filter(r => {
    const d = new Date(r.data_hora)
    return d.getMonth() === calMes && d.getFullYear() === calAno
  })

  // Reuniões do dia seleccionado no calendário
  const reunioesDia = reunioesMes.filter(r => {
    return new Date(r.data_hora).getDate() === diaSelecionado
  })

  const diasComReunioes = new Set(reunioesMes.map(r => new Date(r.data_hora).getDate()))
  const dias = diasDoMes(calAno, calMes)

  // ─── Loading / Erro ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="reunioes-page">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          A carregar reuniões...
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="reunioes-page">
        <div style={{ textAlign: 'center', padding: 80, color: '#e74c3c' }}>
          Erro: {erro}
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="reunioes-page">

      <div className="reunioes-header">
        <h1>Reuniões</h1>
        <div className="reunioes-header-actions">
          <div className="toggle-vista">
            <button
              className={vista === 'lista' ? 'ativo' : ''}
              onClick={() => setVista('lista')}
            >
              <i className="bi bi-list-ul"></i> Lista
            </button>
            <button
              className={vista === 'calendario' ? 'ativo' : ''}
              onClick={() => setVista('calendario')}
            >
              <i className="bi bi-calendar3"></i> Calendário
            </button>
          </div>
          <button className="btn-novo-reuniao" onClick={() => abrirModal()}>
            + Nova Reunião
          </button>
        </div>
      </div>

      {/* ── Vista Lista ───────────────────────────────────────── */}
      {vista === 'lista' && (
        <div className="tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Data / Hora</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>Estado</th>
                <th>Responsável TM</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {reunioes.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Nenhuma reunião agendada.
                  </td>
                </tr>
              )}
              {[...reunioes]
                .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
                .map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.titulo}</td>
                    <td>{r.cliente_nome || r.cliente || '—'}</td>
                    <td>
                      <span className="reuniao-data-badge">
                        <i className="bi bi-calendar-event"></i>
                        {formatDataHora(r.data_hora)}
                      </span>
                    </td>
                    <td>
                      <span className="tipo-badge">{r.tipo}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13 }}>
                        <i className={`bi ${r.formato === 'presencial' ? 'bi-geo-alt' : 'bi-camera-video'}`}></i>
                        {' '}{r.formato || 'online'}
                      </span>
                    </td>
                    <td>
                      {/* Badge com a cor do estado */}
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: getCorEstado(r.estado) + '22',
                        color: getCorEstado(r.estado),
                        border: `1px solid ${getCorEstado(r.estado)}44`
                      }}>
                        {getLabelEstado(r.estado)}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {r.responsavel_trymedia_nome || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-acao editar"
                          onClick={() => abrirModal(r)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-acao apagar"
                          onClick={() => handleApagar(r.id)}
                          title="Apagar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Vista Calendário ──────────────────────────────────── */}
      {vista === 'calendario' && (
        <div className="calendario-wrapper">

          {/* Navegação do mês */}
          <div className="cal-header">
            <button onClick={() => {
              if (calMes === 0) { setCalMes(11); setCalAno(y => y - 1) }
              else setCalMes(m => m - 1)
              setDiaSelecionado(null)
            }}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <h2>{MESES[calMes]} {calAno}</h2>
            <button onClick={() => {
              if (calMes === 11) { setCalMes(0); setCalAno(y => y + 1) }
              else setCalMes(m => m + 1)
              setDiaSelecionado(null)
            }}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          {/* Grelha do calendário */}
          <div className="cal-grid">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="cal-dia-semana">{d}</div>
            ))}
            {dias.map((dia, i) => {
              const ehHoje = dia === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear()
              const temReuniao = dia && diasComReunioes.has(dia)
              const selecionado = dia === diaSelecionado

              return (
                <div
                  key={i}
                  className={[
                    'cal-dia',
                    !dia ? 'vazio' : '',
                    ehHoje ? 'hoje' : '',
                    temReuniao ? 'tem-reuniao' : '',
                    selecionado ? 'selecionado' : '',
                  ].join(' ')}
                  // Ao clicar num dia com reuniões, seleccionamos esse dia
                  onClick={() => dia && setDiaSelecionado(dia)}
                  style={{ cursor: dia ? 'pointer' : 'default' }}
                >
                  {dia && (
                    <>
                      <span className="cal-num">{dia}</span>
                      {temReuniao && <span className="cal-dot"></span>}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Reuniões do dia seleccionado */}
          {diaSelecionado && (
            <div className="cal-reunioes-mes">
              <h3>
                Reuniões a {diaSelecionado} de {MESES[calMes]}
              </h3>
              {reunioesDia.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Sem reuniões neste dia.
                </p>
              ) : (
                reunioesDia.map(r => (
                  <div
                    key={r.id}
                    className="cal-reuniao-item"
                    // Clicável para abrir o modal de edição
                    onClick={() => abrirModal(r)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="cal-reuniao-data">{formatDataHora(r.data_hora)}</span>
                    <span className="cal-reuniao-titulo">{r.titulo}</span>
                    <span className="tipo-badge">{r.tipo}</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: getCorEstado(r.estado) + '22',
                      color: getCorEstado(r.estado),
                    }}>
                      {getLabelEstado(r.estado)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Criar / Editar ──────────────────────────────── */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editandoId ? 'Editar Reunião' : 'Nova Reunião'}</h2>
              <button className="modal-fechar" onClick={fecharModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleGuardar} className="modal-form">

              {/* Título */}
              <div className="form-group">
                <label>Título *</label>
                <input
                  required
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Diagnóstico Grupo Alpha"
                />
              </div>

              {/* Cliente + Responsável da empresa */}
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente</label>
                  <input
                    value={form.cliente}
                    onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="form-group">
                  <label>Responsável da Empresa</label>
                  <input
                    value={form.responsavel_empresa}
                    onChange={e => setForm(f => ({ ...f, responsavel_empresa: e.target.value }))}
                    placeholder="Nome do contacto"
                  />
                </div>
              </div>

              {/* Data + Tipo */}
              <div className="form-row">
                <div className="form-group">
                  <label>Data e Hora *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.data_hora}
                    onChange={e => setForm(f => ({ ...f, data_hora: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Estado + Formato */}
              <div className="form-row">
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                    style={{ borderLeft: `4px solid ${getCorEstado(form.estado)}` }}
                  >
                    {ESTADOS.map(e => (
                      <option key={e.valor} value={e.valor}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Formato *</label>
                  <select
                    value={form.formato}
                    onChange={e => setForm(f => ({ ...f, formato: e.target.value }))}
                  >
                    {FORMATOS.map(f => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsável TRY MEDIA + Canal */}
              <div className="form-row">
                <div className="form-group">
                  <label>Responsável TRY MEDIA</label>
                  <select
                    value={form.responsavel_trymedia}
                    onChange={e => setForm(f => ({ ...f, responsavel_trymedia: e.target.value }))}
                  >
                    <option value="">— Seleccionar —</option>
                    {utilizadores.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Canal de Prospecção</label>
                  <input
                    value={form.canal}
                    onChange={e => setForm(f => ({ ...f, canal: e.target.value }))}
                    placeholder="Link do Instagram, Google Maps, etc."
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="form-group">
                <label>Notas</label>
                <textarea
                  rows={3}
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Observações sobre a reunião..."
                />
              </div>

              {/* Marcado por — informação */}
              <div style={{
                padding: '10px 14px',
                background: 'var(--border)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-muted)'
              }}>
                <i className="bi bi-info-circle"></i>
                {' '}Esta reunião será registada como marcada por{' '}
                <strong style={{ color: 'var(--text)' }}>ti</strong>.
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar-modal" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar-modal" disabled={guardando}>
                  {guardando ? 'A guardar...' : (editandoId ? 'Guardar Alterações' : 'Agendar Reunião')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}