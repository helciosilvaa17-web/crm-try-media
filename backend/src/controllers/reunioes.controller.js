// backend/src/controllers/reunioes.controller.js

const ReuniaoModel = require('../models/reuniao.model')
const UtilizadorModel = require('../models/utilizador.model')
const db = require('../config/db')
const { enviarEmailNovaReuniao } = require('../services/email.service')

const ReunioesController = {

  listar: async (req, res) => {
    try {
      const filtros = {
        mes: req.query.mes,
        ano: req.query.ano,
        estado: req.query.estado
      }
      if (req.utilizador.perfil === 'vendedor') {
        filtros.criado_por = req.utilizador.id
      }
      const reunioes = await ReuniaoModel.listar(filtros)
      res.json(reunioes)
    } catch (err) {
      console.error('Erro ao listar reuniões:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  criar: async (req, res) => {
    const { titulo, data_hora } = req.body
    if (!titulo || !data_hora) {
      return res.status(400).json({ mensagem: 'Título e data são obrigatórios.' })
    }

    try {
      // 1. Criar a reunião na base de dados
      const id = await ReuniaoModel.criar({
        ...req.body,
        criado_por: req.utilizador.id
      })

      // 2. Responder imediatamente ao frontend (não bloquear por causa do email)
      res.status(201).json({ mensagem: 'Reunião criada.', id })

      // 3. Enviar email em background (não await aqui para não atrasar a resposta)
      enviarEmailReuniaoBackground(id, req.body)

    } catch (err) {
      console.error('Erro ao criar reunião:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  atualizar: async (req, res) => {
    try {
      await ReuniaoModel.atualizar(req.params.id, req.body)
      res.json({ mensagem: 'Reunião actualizada.' })
    } catch (err) {
      console.error('Erro ao actualizar reunião:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  apagar: async (req, res) => {
    try {
      await ReuniaoModel.apagar(req.params.id)
      res.json({ mensagem: 'Reunião apagada.' })
    } catch (err) {
      console.error('Erro ao apagar reunião:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  listarUtilizadores: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, nome, perfil FROM utilizadores ORDER BY nome ASC'
      )
      res.json(rows)
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const reuniao = await ReuniaoModel.buscarPorId(req.params.id)

      if (!reuniao) {
        return res.status(404).json({
          mensagem: 'Reunião não encontrada.'
        })
      }

      res.json(reuniao)

    } catch (err) {
      console.error(err)
      res.status(500).json({
        mensagem: 'Erro interno.'
      })
    }
  }

}

// ─── Função auxiliar: enviar email em background ─────────────────────────────
async function enviarEmailReuniaoBackground(reuniaoId, dadosReuniao) {
  try {
    // Determinar o responsável: usa responsavel_trymedia se existir, senão o criador
    const idResponsavel = dadosReuniao.responsavel_trymedia || dadosReuniao.criado_por

    if (!idResponsavel) {
      console.log('⚠️  Reunião sem responsável definido — email não enviado.')
      return
    }

    // Buscar dados do responsável (nome + email)
    const vendedor = await UtilizadorModel.buscarPorId(idResponsavel)

    if (!vendedor || !vendedor.email) {
      console.log(`⚠️  Utilizador ${idResponsavel} não encontrado ou sem email.`)
      return
    }

    // Buscar nome do cliente se existir
    let cliente_nome = 'Não especificado'
    if (dadosReuniao.cliente_id) {
      const [rows] = await require('../config/db').query(
        'SELECT nome_empresa FROM clientes WHERE id = ?',
        [dadosReuniao.cliente_id]
      )
      if (rows[0]) cliente_nome = rows[0].nome_empresa
    }

    await enviarEmailNovaReuniao(vendedor, {
      ...dadosReuniao,
      cliente_nome
    })

  } catch (err) {
    // Erro no email não deve afetar a aplicação — apenas registar
    console.error('❌ Erro ao enviar email de reunião:', err.message)
  }
}

module.exports = ReunioesController