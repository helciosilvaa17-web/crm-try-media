import { useState } from 'react'
import './Reunioes.css'

const MOCK_REUNIOES = [
  { id: 1, titulo: 'Reunião Grupo Alpha', cliente: 'Grupo Alpha', dataHora: '2026-05-25T12:00', tipo: 'Diagnóstico', notas: 'Apresentar portfólio completo.' },
  { id: 2, titulo: 'Follow-up MediaX',    cliente: 'MediaX',      dataHora: '2026-05-28T09:30', tipo: 'Follow-up',   notas: 'Verificar estado da proposta.' },
  { id: 3, titulo: 'Proposta StartupKilamba', cliente: 'StartupKilamba', dataHora: '2026-05-30T14:00', tipo: 'Proposta', notas: '' },
]

const TIPOS = ['Diagnóstico', 'Follow-up', 'Proposta', 'Reunião Interna', 'Outro']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

const FORM_VAZIO = { titulo: '', cliente: '', dataHora: '', tipo: 'Diagnóstico', notas: '' }

function formatDataHora(str) {
  const d = new Date(str)
  return d.toLocaleDateString('pt-AO', { day:'2-digit', month:'short' }) +
    ' · ' + d.toLocaleTimeString('pt-AO', { hour:'2-digit', minute:'2-digit' })
}

// Gera os dias do mês para o calendário
function diasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1)
  const ultimo   = new Date(ano, mes + 1, 0)
  // Ajusta: getDay() 0=Dom, queremos 0=Seg
  let inicioSemana = (primeiro.getDay() + 6) % 7
  const dias = []
  for (let i = 0; i < inicioSemana; i++) dias.push(null)
  for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d)
  return dias
}

export default function Reunioes() {
  const [vista, setVista] = useState('lista')
  const [reunioes, setReunioes] = useState(MOCK_REUNIOES)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)

  const hoje = new Date()
  const [calMes, setCalMes] = useState(hoje.getMonth())
  const [calAno, setCalAno] = useState(hoje.getFullYear())

  const abrirModal = (r = null) => {
    if (r) { setForm({ ...r }); setEditandoId(r.id) }
    else   { setForm(FORM_VAZIO); setEditandoId(null) }
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setForm(FORM_VAZIO); setEditandoId(null) }

  const handleGuardar = (e) => {
    e.preventDefault()
    if (editandoId) {
      setReunioes(r => r.map(m => m.id === editandoId ? { ...m, ...form } : m))
    } else {
      setReunioes(r => [...r, { ...form, id: Date.now() }])
    }
    fecharModal()
  }

  const handleApagar = (id) => setReunioes(r => r.filter(m => m.id !== id))

  // Reuniões do mês do calendário
  const reunioesMes = reunioes.filter(r => {
    const d = new Date(r.dataHora)
    return d.getMonth() === calMes && d.getFullYear() === calAno
  })

  const diasComReunioes = new Set(reunioesMes.map(r => new Date(r.dataHora).getDate()))
  const dias = diasDoMes(calAno, calMes)

  return (
    <div className="reunioes-page">

      {/* Header */}
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

      {/* Vista Lista */}
      {vista === 'lista' && (
        <div className="tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Data / Hora</th>
                <th>Tipo</th>
                <th>Notas</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {reunioes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>
                    Nenhuma reunião agendada.
                  </td>
                </tr>
              )}
              {[...reunioes].sort((a,b) => new Date(a.dataHora) - new Date(b.dataHora)).map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight:600 }}>{r.titulo}</td>
                  <td>{r.cliente}</td>
                  <td>
                    <span className="reuniao-data-badge">
                      <i className="bi bi-calendar-event"></i>
                      {formatDataHora(r.dataHora)}
                    </span>
                  </td>
                  <td>
                    <span className="tipo-badge">{r.tipo}</span>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>
                    {r.notas || '—'}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:10 }}>
                      <button className="btn-acao editar" onClick={() => abrirModal(r)} title="Editar">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn-acao apagar" onClick={() => handleApagar(r.id)} title="Apagar">
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

      {/* Vista Calendário */}
      {vista === 'calendario' && (
        <div className="calendario-wrapper">
          <div className="cal-header">
            <button onClick={() => {
              if (calMes === 0) { setCalMes(11); setCalAno(y => y - 1) }
              else setCalMes(m => m - 1)
            }}><i className="bi bi-chevron-left"></i></button>
            <h2>{MESES[calMes]} {calAno}</h2>
            <button onClick={() => {
              if (calMes === 11) { setCalMes(0); setCalAno(y => y + 1) }
              else setCalMes(m => m + 1)
            }}><i className="bi bi-chevron-right"></i></button>
          </div>

          <div className="cal-grid">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="cal-dia-semana">{d}</div>
            ))}
            {dias.map((dia, i) => (
              <div
                key={i}
                className={`cal-dia ${!dia ? 'vazio' : ''} ${dia === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear() ? 'hoje' : ''} ${dia && diasComReunioes.has(dia) ? 'tem-reuniao' : ''}`}
              >
                {dia && (
                  <>
                    <span className="cal-num">{dia}</span>
                    {diasComReunioes.has(dia) && <span className="cal-dot"></span>}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Reuniões do mês */}
          {reunioesMes.length > 0 && (
            <div className="cal-reunioes-mes">
              <h3>Reuniões em {MESES[calMes]}</h3>
              {reunioesMes.map(r => (
                <div key={r.id} className="cal-reuniao-item">
                  <span className="cal-reuniao-data">{formatDataHora(r.dataHora)}</span>
                  <span className="cal-reuniao-titulo">{r.titulo}</span>
                  <span className="tipo-badge">{r.tipo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoId ? 'Editar Reunião' : 'Nova Reunião'}</h2>
              <button className="modal-fechar" onClick={fecharModal}><i className="bi bi-x-lg"></i></button>
            </div>
            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-group">
                <label>Título *</label>
                <input required value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} placeholder="Ex: Reunião com cliente X" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente *</label>
                  <input required value={form.cliente} onChange={e => setForm(f => ({...f, cliente: e.target.value}))} placeholder="Nome do cliente" />
                </div>
                <div className="form-group">
                  <label>Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Data e Hora *</label>
                <input required type="datetime-local" value={form.dataHora} onChange={e => setForm(f => ({...f, dataHora: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea rows={3} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} placeholder="Observações sobre a reunião..." />
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn-cancelar-modal" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-guardar-modal">
                  {editandoId ? 'Guardar Alterações' : 'Agendar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
