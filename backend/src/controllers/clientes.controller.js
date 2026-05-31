const ClienteModel = require('../models/cliente.model')

const ClientesController = {
  listar: async (req, res) => {
    try {
      const filtros = { status: req.query.status, pesquisa: req.query.pesquisa }
      if (req.utilizador.perfil === 'vendedor') filtros.vendedor_id = req.utilizador.id
      const clientes = await ClienteModel.listar(filtros)
      res.json(clientes)
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  obter: async (req, res) => {
    try {
      const cliente = await ClienteModel.encontrarPorId(req.params.id)
      if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' })
      const interacoes = await ClienteModel.listarInteracoes(req.params.id)
      res.json({ ...cliente, interacoes })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  criar: async (req, res) => {
    const { nome_empresa, status } = req.body
    if (!nome_empresa || !status) return res.status(400).json({ mensagem: 'Nome da empresa e status são obrigatórios.' })
    try {
      const dados = { ...req.body, vendedor_id: req.body.vendedor_id || req.utilizador.id }
      const id = await ClienteModel.criar(dados)
      res.status(201).json({ mensagem: 'Cliente criado.', id })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  atualizar: async (req, res) => {
    try {
      await ClienteModel.atualizar(req.params.id, req.body)
      res.json({ mensagem: 'Cliente actualizado.' })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  apagar: async (req, res) => {
    try {
      await ClienteModel.apagar(req.params.id)
      res.json({ mensagem: 'Cliente apagado.' })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  criarInteracao: async (req, res) => {
    const { tipo, nota } = req.body
    if (!tipo || !nota) return res.status(400).json({ mensagem: 'Tipo e nota são obrigatórios.' })
    try {
      await ClienteModel.criarInteracao(req.params.id, tipo, nota, req.utilizador.id)
      res.status(201).json({ mensagem: 'Interacção registada.' })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  editarInteracao: async (req, res) => {
  try {
    const { tipo, nota } = req.body
    await db.query(
      'UPDATE interacoes SET tipo = ?, nota = ? WHERE id = ? AND cliente_id = ?',
      [tipo, nota, req.params.id, req.params.clienteId]
    )
    res.json({ mensagem: 'Interacção actualizada.' })
  } catch (err) {
    console.error('Erro ao editar interacção:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
},

apagarInteracao: async (req, res) => {
  try {
    await db.query(
      'DELETE FROM interacoes WHERE id = ? AND cliente_id = ?',
      [req.params.id, req.params.clienteId]
    )
    res.json({ mensagem: 'Interacção removida.' })
  } catch (err) {
    console.error('Erro ao apagar interacção:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
},

}

module.exports = ClientesController