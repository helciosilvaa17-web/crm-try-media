import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Pipeline.css'

const MOCK_CLIENTES = [
  { id: 1, empresa: 'Grupo Alpha', nicho: 'Marketing',   status: 'fechado',    prioridade: 'Alta',  valor: 200000, vendedor: 'Hélcio', ultimoContacto: '12/05/2026', telefone: '923000001' },
  { id: 2, empresa: 'MediaX',      nicho: 'Audiovisual', status: 'negociacao', prioridade: 'Média', valor: 150000, vendedor: 'João',   ultimoContacto: '10/05/2026', telefone: '923000002' },
  { id: 3, empresa: 'StartupKilamba', nicho: 'Tech',     status: 'progresso',  prioridade: 'Média', valor: 500000, vendedor: 'Hélcio', ultimoContacto: '09/05/2026', telefone: '923000003' },
]

const LABELS_STATUS = {
  novo:        'Novo',
  contacto:    'Contacto Inicial',
  qualificado: 'Qualificado',
  negociacao:  'Negociação',
  progresso:   'Em Progresso',
  fechado:     'Fechado',
}

const STATUS_OPTIONS = Object.entries(LABELS_STATUS)

const FORM_VAZIO = {
  empresa: '', nicho: '', status: 'novo', prioridade: 'Média',
  valor: '', vendedor: '', telefone: '', email: '', whatsapp: '',
  ultimoContacto: '', fechoPrevisto: '', observacoes: '', linkInfo: ''
}

export default function Pipeline() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(MOCK_CLIENTES)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmarId, setConfirmarId] = useState(null)

  // Filtros
  const filtrados = clientes.filter(c => {
    const matchStatus = !filtroStatus || c.status === filtroStatus
    const matchPesquisa = !pesquisa ||
      c.empresa.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.nicho.toLowerCase().includes(pesquisa.toLowerCase())
    return matchStatus && matchPesquisa
  })

  // Abrir modal (novo ou editar)
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setForm({ ...FORM_VAZIO, ...cliente })
      setEditandoId(cliente.id)
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

  // Guardar (criar ou editar)
  const handleGuardar = (e) => {
    e.preventDefault()
    if (editandoId) {
      setClientes(c => c.map(cl => cl.id === editandoId ? { ...cl, ...form } : cl))
    } else {
      const novoId = Math.max(...clientes.map(c => c.id), 0) + 1
      setClientes(c => [...c, { ...form, id: novoId, valor: Number(form.valor) }])
    }
    fecharModal()
  }

  // Apagar
  const handleApagar = (id) => {
    setClientes(c => c.filter(cl => cl.id !== id))
    setConfirmarId(null)
  }

  const handleWhatsApp = (telefone) => {
    window.open(`https://wa.me/244${telefone}`, '_blank')
  }

  const formatKz = (v) => Number(v).toLocaleString('pt-AO') + ' Kz'

  return (
    <div className="pipeline-page">

      {/* Cabeçalho */}
      <div className="pipeline-header">
        <h1>Pipeline de Clientes</h1>
        <div className="pipeline-header-actions">
          <select
            className="filtro-status"
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button className="btn-novo" onClick={() => abrirModal()}>
            + Novo Cliente
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="tabela-wrapper">
        <table className="tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Nicho</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Valor</th>
              <th>Vendedor</th>
              <th>Último Contacto</th>
              <th>Acções</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {filtrados.map((c, i) => (
              <tr key={c.id}>
                <td className="td-id">{String(i + 1).padStart(3, '0')}</td>
                <td>
                  <button className="link-empresa" onClick={() => navigate(`/cliente/${c.id}`)}>
                    {c.empresa}
                  </button>
                </td>
                <td>{c.nicho}</td>
                <td>
                  <span className={`badge ${c.status}`}>
                    {LABELS_STATUS[c.status]}
                  </span>
                </td>
                <td>{c.prioridade}</td>
                <td>{formatKz(c.valor)}</td>
                <td>{c.vendedor}</td>
                <td>{c.ultimoContacto}</td>
                <td className="td-acoes">
                  <button
                    className="btn-acao whatsapp"
                    title="WhatsApp"
                    onClick={() => handleWhatsApp(c.telefone)}
                  >
                    <i className="bi bi-whatsapp"></i>
                  </button>
                  <button
                    className="btn-acao editar"
                    title="Editar"
                    onClick={() => abrirModal(c)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn-acao apagar"
                    title="Apagar"
                    onClick={() => setConfirmarId(c.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo/Editar Cliente */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="modal-fechar" onClick={fecharModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleGuardar} className="modal-form">

              <div className="form-row">
                <div className="form-group">
                  <label>Empresa *</label>
                  <input required value={form.empresa} onChange={e => setForm(f => ({...f, empresa: e.target.value}))} placeholder="Nome da empresa" />
                </div>
                <div className="form-group">
                  <label>Nicho *</label>
                  <input required value={form.nicho} onChange={e => setForm(f => ({...f, nicho: e.target.value}))} placeholder="Ex: Marketing" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    {STATUS_OPTIONS.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridade *</label>
                  <select value={form.prioridade} onChange={e => setForm(f => ({...f, prioridade: e.target.value}))}>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor Estimado (Kz)</label>
                  <input type="number" value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Vendedor *</label>
                  <input required value={form.vendedor} onChange={e => setForm(f => ({...f, vendedor: e.target.value}))} placeholder="Nome do vendedor" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm(f => ({...f, telefone: e.target.value}))} placeholder="9XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))} placeholder="9XXXXXXXX" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Último Contacto</label>
                  <input type="date" value={form.ultimoContacto} onChange={e => setForm(f => ({...f, ultimoContacto: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Fecho Previsto</label>
                  <input type="date" value={form.fechoPrevisto} onChange={e => setForm(f => ({...f, fechoPrevisto: e.target.value}))} />
                </div>
              </div>

              <div className="form-group">
                <label>Link de Informação (Notion, Drive, etc.)</label>
                <input value={form.linkInfo} onChange={e => setForm(f => ({...f, linkInfo: e.target.value}))} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea rows={3} value={form.observacoes} onChange={e => setForm(f => ({...f, observacoes: e.target.value}))} placeholder="Notas sobre o cliente..." />
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar-modal" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-guardar-modal">
                  {editandoId ? 'Guardar Alterações' : 'Adicionar Cliente'}
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
            <h2>Apagar cliente?</h2>
            <p>Esta acção não pode ser revertida.</p>
            <div className="modal-acoes">
              <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>Cancelar</button>
              <button className="btn-apagar-confirm" onClick={() => handleApagar(confirmarId)}>
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
