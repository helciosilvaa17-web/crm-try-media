const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const UtilizadorModel = require('../models/utilizador.model')
const { enviarEmailBoasVindas } = require('../services/email.service')

const AuthController = {
  login: async (req, res) => {
    const { email, senha } = req.body
    if (!email || !senha) return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' })
    try {
      const utilizador = await UtilizadorModel.encontrarPorEmail(email)
      if (!utilizador) return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
      const senhaCorreta = await bcrypt.compare(senha, utilizador.palavra_passe)
      if (!senhaCorreta) return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
      const token = jwt.sign(
        { id: utilizador.id, nome: utilizador.nome, email: utilizador.email, perfil: utilizador.perfil },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      )
      res.json({ token, utilizador: { id: utilizador.id, nome: utilizador.nome, email: utilizador.email, perfil: utilizador.perfil } })
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro interno do servidor.' })
    }
  },

  criarConta: async (req, res) => {
    const { nome, email, senha, perfil } = req.body
    if (!nome || !email || !senha || !perfil) return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
    if (!['administrador', 'vendedor'].includes(perfil)) return res.status(400).json({ mensagem: 'Perfil inválido.' })
    try {
      const existe = await UtilizadorModel.encontrarPorEmail(email)
      if (existe) return res.status(409).json({ mensagem: 'Este e-mail já está registado.' })
      const hash = await bcrypt.hash(senha, 12)
      await UtilizadorModel.criar(nome, email, hash, perfil)

      // Buscar email do administrador para notificar
      const admins = await UtilizadorModel.listar()
      const admin  = admins.find(u => u.perfil === 'administrador')

      // Enviar emails em background
      if (admin) {
        enviarEmailBoasVindas({ nome, email, perfil }, admin.email).catch(err =>
          console.error('❌ Erro ao enviar email de boas-vindas:', err.message)
        )
      }

      res.status(201).json({ mensagem: 'Utilizador criado com sucesso.' })
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro interno do servidor.' })
    }
  },

  me: (req, res) => {
    res.json({ utilizador: req.utilizador })
  }
}

module.exports = AuthController