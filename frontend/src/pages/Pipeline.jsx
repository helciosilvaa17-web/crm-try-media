// frontend/src/pages/Pipeline.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './Pipeline.css'

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
  nome_empresa: '', nicho: '', status: 'novo', prioridade: 'médio',
  valor_estimado: '', telefone: '', email: '', whatsapp: '',
  ultimo_contacto: '', fecho_previsto: '', observacoes: '', link_info: ''
}

// Nota: os campos agora usam os nomes exactos da base de dados
// nome_empresa (não empresa), valor_estimado (não valor), etc.

export default function Pipeline() {
  const navigate = useNavigate()
  
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  
  const [filtroStatus, setFiltroStatus] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  
  const [confirmarId, setConfirmarId] = useState(null)
  const [apagando, setApagando] = useState(false)

  // ─────────────────────────────────────────
  // Carregar clientes da API
  // Corre quando os filtros mudam (status ou pesquisa)
  // ─────────────────────────────────────────
  useEffect(() => {
    async function carregarClientes() {
      try {
        setLoading(true)
        setErro(null)
        
        // Construímos os query params dinamicamente
        // Resultado: /clientes?status=fechado&pesquisa=alpha
        const params = new URLSearchParams()
        if (filtroStatus) params.append('status', filtroStatus)
        if (pesquisa)     params.append('pesquisa', pesquisa)
        
        const caminho = `/clientes${params.toString() ? '?' + params.toString() : ''}`
        const dados = await api.get(caminho)
        
        setClientes(dados)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    // Pequeno atraso na pesquisa para não chamar a API em cada letra digitada
    // Isto chama-se "debounce" — espera 400ms após a última tecla
    const timer = setTimeout(carregarClientes, pesquisa ? 400 : 0)
    
    // O useEffect pode devolver uma função de limpeza
    // Esta corre antes do próximo efeito — cancela o timer anterior
    return () => clearTimeout(timer)
    
  }, [filtroStatus, pesquisa])  // Corre sempre que estes valores mudam

  // ─────────────────────────────────────────
  // Abrir modal
  // ─────────────────────────────────────────
  const abrirModal = (cliente = null) => {
    if (cliente) {
      // Mapeamos os campos da BD para o form
      setForm({
        nome_empresa:    cliente.nome_empresa || '',
        nicho:           cliente.nicho || '',
        status:          cliente.status || 'novo',
        prioridade:      cliente.prioridade || 'médio',
        valor_estimado:  cliente.valor_estimado || '',
        telefone:        cliente.telefone || '',
        email:           cliente.email || '',
        whatsapp:        cliente.whatsapp || '',
        ultimo_contacto: cliente.ultimo_contacto?.split('T')[0] || '',
        fecho_previsto:  cliente.fecho_previsto?.split('T')[0] || '',
        observacoes:     cliente.observacoes || '',
        link_info:       cliente.link_info || '',
      })
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

  // ─────────────────────────────────────────
  // Guardar (criar ou editar)
  // ─────────────────────────────────────────
  const handleGuardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    
    try {
      if (editandoId) {
        // PUT /api/clientes/:id — actualizar cliente existente
        await api.put(`/clientes/${editandoId}`, form)
      } else {
        // POST /api/clientes — criar novo cliente
        await api.post('/clientes', form)
      }
      
      // Após guardar, fechamos o modal e recarregamos a lista
      // O useEffect vai disparar automaticamente porque o estado não mudou,
      // então chamamos manualmente a actualização
      fecharModal()
      
      // Recalculamos os params e buscamos de novo
      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)
      if (pesquisa)     params.append('pesquisa', pesquisa)
      const caminho = `/clientes${params.toString() ? '?' + params.toString() : ''}`
      const dados = await api.get(caminho)
      setClientes(dados)
      
    } catch (err) {
      alert('Erro ao guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  // ─────────────────────────────────────────
  // Apagar
  // ─────────────────────────────────────────
  const handleApagar = async (id) => {
    setApagando(true)
    try {
      // DELETE /api/clientes/:id — só admins conseguem (o backend verifica)
      await api.delete(`/clientes/${id}`)
      
      // Em vez de ir buscar de novo à API, removemos localmente
      // Isto é mais rápido e evita uma chamada desnecessária
      setClientes(c => c.filter(cl => cl.id !== id))
      setConfirmarId(null)
      
    } catch (err) {
      alert('Erro ao apagar: ' + err.message)
    } finally {
      setApagando(false)
    }
  }

  const handleWhatsApp = (whatsapp) => {
    if (!whatsapp) return alert('Este cliente não tem WhatsApp registado.')
    window.open(`https://wa.me/244${whatsapp}`, '_blank')
  }

  const handleEmail = (email) => {
    if (!email) return alert('Este cliente não tem e-mail registado.')
    window.open(`mailto:${email}`, '_blank')
  }

  const formatKz = (v) => Number(v || 0).toLocaleString('pt-AO') + ' Kz'

  return (
    <div className="pipeline-page">

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

      {/* Campo de pesquisa */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Pesquisar por empresa ou nicho..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            width: 280
          }}
        />
      </div>

      {/* Estados de loading e erro */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          A carregar clientes...
        </div>
      )}

      {erro && (
        <div style={{ textAlign: 'center', padding: 40, color: '#e74c3c' }}>
          Erro: {erro}
        </div>
      )}

      {!loading && !erro && (
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
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {clientes.map((c, i) => (
                <tr key={c.id}>
                  <td className="td-id">{String(i + 1).padStart(3, '0')}</td>
                  <td>
                    <button className="link-empresa" onClick={() => navigate(`/cliente/${c.id}`)}>
                      {c.nome_empresa}
                    </button>
                  </td>
                  <td>{c.nicho}</td>
                  <td>
                    <span className={`badge ${c.status}`}>
                      {LABELS_STATUS[c.status] || c.status}
                    </span>
                  </td>
                  <td>{c.prioridade}</td>
                  <td>{formatKz(c.valor_estimado)}</td>
                  <td>{c.vendedor_nome || '—'}</td>
                  <td>
                    {c.ultimo_contacto
                      ? new Date(c.ultimo_contacto).toLocaleDateString('pt-AO')
                      : '—'}
                  </td>
                  <td className="td-acoes">
                    <button
                      className="btn-acao whatsapp"
                      title="WhatsApp"
                      onClick={() => handleWhatsApp(c.whatsapp)}
                    >
                      <i className="bi bi-whatsapp"></i>
                    </button>
                    <button
                      className="btn-acao email"
                      title="E-mail"
                      onClick={() => handleEmail(c.email)}
                    >
                      <i className="bi bi-envelope-fill"></i>
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
      )}

      {/* Modal Criar/Editar */}
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
                  <input
                    required
                    value={form.nome_empresa}
                    onChange={e => setForm(f => ({ ...f, nome_empresa: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="form-group">
                  <label>Nicho *</label>
                  <input
                    required
                    value={form.nicho}
                    onChange={e => setForm(f => ({ ...f, nicho: e.target.value }))}
                    placeholder="Ex: Marketing"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridade *</label>
                  <select
                    value={form.prioridade}
                    onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}
                  >
                    {/* Alinhados com o ENUM da base de dados */}
                    <option value="Alto">Alta</option>
                    <option value="Médio">Média</option>
                    <option value="Baixo">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor Estimado (Kz)</label>
                  <input
                    type="number"
                    value={form.valor_estimado}
                    onChange={e => setForm(f => ({ ...f, valor_estimado: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                    placeholder="9XXXXXXXX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@empresa.ao"
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="9XXXXXXXX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Último Contacto</label>
                  <input
                    type="date"
                    value={form.ultimo_contacto}
                    onChange={e => setForm(f => ({ ...f, ultimo_contacto: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Fecho Previsto</label>
                  <input
                    type="date"
                    value={form.fecho_previsto}
                    onChange={e => setForm(f => ({ ...f, fecho_previsto: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Link de Informação</label>
                <input
                  value={form.link_info}
                  onChange={e => setForm(f => ({ ...f, link_info: e.target.value }))}
                  placeholder="https://notion.so/..."
                />
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  placeholder="Notas sobre o cliente..."
                />
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar-modal" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar-modal" disabled={guardando}>
                  {guardando ? 'A guardar...' : (editandoId ? 'Guardar Alterações' : 'Adicionar Cliente')}
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
              <button className="btn-cancelar-modal" onClick={() => setConfirmarId(null)}>
                Cancelar
              </button>
              <button
                className="btn-apagar-confirm"
                onClick={() => handleApagar(confirmarId)}
                disabled={apagando}
              >
                {apagando ? 'A apagar...' : 'Sim, apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}