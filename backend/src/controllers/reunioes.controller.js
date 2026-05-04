const ReuniaoModel = require('../models/reuniao.model')

const ReunioesController = {
  listar: async (req, res) => {
    try {
      const filtros = { mes: req.query.mes, ano: req.query.ano }
      if (req.utilizador.perfil === 'vendedor') filtros.criado_por = req.utilizador.id
      const reunioes = await ReuniaoModel.listar(filtros)
      res.json(reunioes)
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  criar: async (req, res) => {
    const { titulo, data_hora } = req.body
    if (!titulo || !data_hora) return res.status(400).json({ mensagem: 'Título e data são obrigatórios.' })
    try {
      const id = await ReuniaoModel.criar({ ...req.body, criado_por: req.utilizador.id })
      res.status(201).json({ mensagem: 'Reunião criada.', id })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  atualizar: async (req, res) => {
    try {
      await ReuniaoModel.atualizar(req.params.id, req.body)
      res.json({ mensagem: 'Reunião actualizada.' })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  },

  apagar: async (req, res) => {
    try {
      await ReuniaoModel.apagar(req.params.id)
      res.json({ mensagem: 'Reunião apagada.' })
    } catch (err) { res.status(500).json({ mensagem: 'Erro interno.' }) }
  }
}

module.exports = ReunioesController