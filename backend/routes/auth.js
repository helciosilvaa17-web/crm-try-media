const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const db       = require('../db')
const { autenticar, apenasAdmin } = require('../middleware/auth')

const router = express.Router()

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' })
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM utilizadores WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
    }

    const utilizador = rows[0]
    const senhaCorreta = await bcrypt.compare(senha, utilizador.palavra_passe)

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      {
        id:     utilizador.id,
        nome:   utilizador.nome,
        email:  utilizador.email,
        perfil: utilizador.perfil,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      utilizador: {
        id:     utilizador.id,
        nome:   utilizador.nome,
        email:  utilizador.email,
        perfil: utilizador.perfil,
      }
    })
  } catch (err) {
    console.error('Erro no login:', err)
    res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
})

// ─────────────────────────────────────────
// POST /api/auth/criar-conta  (só Admin)
// ─────────────────────────────────────────
router.post('/criar-conta', autenticar, apenasAdmin, async (req, res) => {
  const { nome, email, senha, perfil } = req.body

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
  }

  if (!['administrador', 'vendedor'].includes(perfil)) {
    return res.status(400).json({ mensagem: 'Perfil inválido.' })
  }

  try {
    // Verifica email duplicado
    const [existe] = await db.query(
      'SELECT id FROM utilizadores WHERE email = ?',
      [email]
    )
    if (existe.length > 0) {
      return res.status(409).json({ mensagem: 'Este e-mail já está registado.' })
    }

    const hash = await bcrypt.hash(senha, 12)

    await db.query(
      'INSERT INTO utilizadores (nome, email, palavra_passe, perfil) VALUES (?, ?, ?, ?)',
      [nome, email, hash, perfil]
    )

    res.status(201).json({ mensagem: 'Utilizador criado com sucesso.' })
  } catch (err) {
    console.error('Erro ao criar conta:', err)
    res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
})

// ─────────────────────────────────────────
// GET /api/auth/me — retorna utilizador logado
// ─────────────────────────────────────────
router.get('/me', autenticar, (req, res) => {
  res.json({ utilizador: req.utilizador })
})

module.exports = router
