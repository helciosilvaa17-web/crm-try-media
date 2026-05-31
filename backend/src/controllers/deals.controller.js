const DealModel = require('../models/deal.model')

const DealsController = {

  listar: async (req, res) => {
    try {
      const filtros = { mes: req.query.mes, ano: req.query.ano }
      if (req.utilizador.perfil === 'vendedor') {
        filtros.vendedor_id = req.utilizador.id
      }
      const deals = await DealModel.listar(filtros)
      res.json(deals)
    } catch (err) {
      console.error('Erro ao listar deals:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  criar: async (req, res) => {
    const { descricao, cliente_nome, servico, valor, data_deal } = req.body
    if (!descricao || !cliente_nome || !servico || !valor || !data_deal) {
      return res.status(400).json({ mensagem: 'Preenche todos os campos obrigatórios.' })
    }
    try {
      const id = await DealModel.criar({ ...req.body, vendedor_id: req.utilizador.id })
      res.status(201).json({ mensagem: 'Deal criado.', id })
    } catch (err) {
      console.error('Erro ao criar deal:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  apagar: async (req, res) => {
    try {
      await DealModel.apagar(req.params.id)
      res.json({ mensagem: 'Deal removido.' })
    } catch (err) {
      console.error('Erro ao apagar deal:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  }
}

module.exports = DealsController