// backend/src/controllers/reunioes.controller.js

const ReuniaoModel = require('../models/reuniao.model')
const db = require('../config/db')
const { enviarConfirmacao } = require('../services/email.service')

const ReunioesController = {

  listar: async (req, res) => {
    try {
      const filtros = {
        mes: req.query.mes,
        ano: req.query.ano,
        estado: req.query.estado
      }
      // Vendedor só vê as suas reuniões
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
      const id = await ReuniaoModel.criar({
        ...req.body,
        criado_por: req.utilizador.id
      })

      // Busca a reunião completa com os e-mails dos responsáveis
      const [[reuniao]] = await db.query(`
      SELECT r.*, c.nome_empresa AS cliente_nome,
        criador.email AS criador_email,
        resp.email    AS resp_email
      FROM reunioes r
      LEFT JOIN clientes      c       ON r.cliente_id           = c.id
      LEFT JOIN utilizadores  criador ON r.criado_por           = criador.id
      LEFT JOIN utilizadores  resp    ON r.responsavel_trymedia = resp.id
      WHERE r.id = ?
    `, [id])

      // Envia confirmação (sem bloquear a resposta em caso de erro de e-mail)
      const emails = new Set()
      if (reuniao.criador_email) emails.add(reuniao.criador_email)
      if (reuniao.resp_email) emails.add(reuniao.resp_email)
      if (emails.size > 0) {
        enviarConfirmacao(reuniao, [...emails]).catch(err =>
          console.error('Erro ao enviar confirmação:', err.message)
        )
      }

      res.status(201).json({ mensagem: 'Reunião criada.', id })
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

  // Novo endpoint — devolve os utilizadores para o selector
  // de "Responsável TRY MEDIA" no formulário do frontend
  listarUtilizadores: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, nome, perfil FROM utilizadores ORDER BY nome ASC'
      )
      res.json(rows)
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  }
}

module.exports = ReunioesController