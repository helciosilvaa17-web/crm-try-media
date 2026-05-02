const express = require('express')
const db      = require('../db')
const { autenticar } = require('../middleware/auth')

const router = express.Router()
router.use(autenticar)

// GET /api/reunioes
router.get('/', async (req, res) => {
  try {
    const { mes, ano } = req.query
    let sql = `
      SELECT r.*, c.nome_empresa AS cliente_nome, u.nome AS criado_por_nome
      FROM reunioes r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      LEFT JOIN utilizadores u ON r.criado_por = u.id
      WHERE 1=1
    `
    const params = []

    if (req.utilizador.perfil === 'vendedor') {
      sql += ' AND r.criado_por = ?'
      params.push(req.utilizador.id)
    }

    if (mes && ano) {
      sql += ' AND MONTH(r.data_hora) = ? AND YEAR(r.data_hora) = ?'
      params.push(mes, ano)
    }

    sql += ' ORDER BY r.data_hora ASC'

    const [rows] = await db.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar reuniões:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// POST /api/reunioes
router.post('/', async (req, res) => {
  const { titulo, cliente_id, data_hora, tipo, notas } = req.body
  if (!titulo || !data_hora) {
    return res.status(400).json({ mensagem: 'Título e data são obrigatórios.' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO reunioes (titulo, cliente_id, data_hora, tipo, notas, criado_por) VALUES (?,?,?,?,?,?)',
      [titulo, cliente_id || null, data_hora, tipo || 'diagnóstico', notas || '', req.utilizador.id]
    )
    res.status(201).json({ mensagem: 'Reunião criada.', id: result.insertId })
  } catch (err) {
    console.error('Erro ao criar reunião:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// PUT /api/reunioes/:id
router.put('/:id', async (req, res) => {
  const { titulo, cliente_id, data_hora, tipo, notas } = req.body
  try {
    await db.query(
      'UPDATE reunioes SET titulo=?, cliente_id=?, data_hora=?, tipo=?, notas=? WHERE id=?',
      [titulo, cliente_id, data_hora, tipo, notas, req.params.id]
    )
    res.json({ mensagem: 'Reunião actualizada.' })
  } catch (err) {
    console.error('Erro ao actualizar reunião:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// DELETE /api/reunioes/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reunioes WHERE id = ?', [req.params.id])
    res.json({ mensagem: 'Reunião apagada.' })
  } catch (err) {
    console.error('Erro ao apagar reunião:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

module.exports = router
