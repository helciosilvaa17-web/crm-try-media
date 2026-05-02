const express = require('express')
const db      = require('../db')
const { autenticar, apenasAdmin } = require('../middleware/auth')

const router = express.Router()

// Todos os endpoints requerem autenticação
router.use(autenticar)

// ─────────────────────────────────────────
// GET /api/clientes — lista todos
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, pesquisa } = req.query
    let sql = `
      SELECT c.*, u.nome AS vendedor_nome
      FROM clientes c
      LEFT JOIN utilizadores u ON c.vendedor_id = u.id
      WHERE 1=1
    `
    const params = []

    // Vendedor só vê os seus próprios clientes
    if (req.utilizador.perfil === 'vendedor') {
      sql += ' AND c.vendedor_id = ?'
      params.push(req.utilizador.id)
    }

    if (status) {
      sql += ' AND c.status = ?'
      params.push(status)
    }

    if (pesquisa) {
      sql += ' AND (c.nome_empresa LIKE ? OR c.nicho LIKE ?)'
      params.push(`%${pesquisa}%`, `%${pesquisa}%`)
    }

    sql += ' ORDER BY c.criado_em DESC'

    const [rows] = await db.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar clientes:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// GET /api/clientes/:id — detalhe
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.nome AS vendedor_nome
       FROM clientes c
       LEFT JOIN utilizadores u ON c.vendedor_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Cliente não encontrado.' })

    // Busca interacções
    const [interacoes] = await db.query(
      `SELECT i.*, u.nome AS utilizador_nome
       FROM interacoes i
       LEFT JOIN utilizadores u ON i.utilizador_id = u.id
       WHERE i.cliente_id = ?
       ORDER BY i.data DESC`,
      [req.params.id]
    )

    res.json({ ...rows[0], interacoes })
  } catch (err) {
    console.error('Erro ao buscar cliente:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// POST /api/clientes — criar
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    nome_empresa, nicho, telefone, email, whatsapp,
    valor_estimado, status, prioridade,
    ultimo_contacto, fecho_previsto, link_info, observacoes,
    vendedor_id
  } = req.body

  if (!nome_empresa || !status) {
    return res.status(400).json({ mensagem: 'Nome da empresa e status são obrigatórios.' })
  }

  try {
    const vidFinal = vendedor_id || req.utilizador.id
    const [result] = await db.query(
      `INSERT INTO clientes
        (nome_empresa, nicho, telefone, email, whatsapp,
         valor_estimado, status, prioridade,
         ultimo_contacto, fecho_previsto, link_info, observacoes, vendedor_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [nome_empresa, nicho, telefone, email, whatsapp,
       valor_estimado || 0, status, prioridade || 'médio',
       ultimo_contacto || null, fecho_previsto || null,
       link_info, observacoes, vidFinal]
    )
    res.status(201).json({ mensagem: 'Cliente criado.', id: result.insertId })
  } catch (err) {
    console.error('Erro ao criar cliente:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// PUT /api/clientes/:id — editar
// ─────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const {
    nome_empresa, nicho, telefone, email, whatsapp,
    valor_estimado, status, prioridade,
    ultimo_contacto, fecho_previsto, link_info, observacoes, vendedor_id
  } = req.body

  try {
    await db.query(
      `UPDATE clientes SET
        nome_empresa=?, nicho=?, telefone=?, email=?, whatsapp=?,
        valor_estimado=?, status=?, prioridade=?,
        ultimo_contacto=?, fecho_previsto=?, link_info=?, observacoes=?, vendedor_id=?
       WHERE id=?`,
      [nome_empresa, nicho, telefone, email, whatsapp,
       valor_estimado, status, prioridade,
       ultimo_contacto, fecho_previsto, link_info, observacoes,
       vendedor_id, req.params.id]
    )
    res.json({ mensagem: 'Cliente actualizado.' })
  } catch (err) {
    console.error('Erro ao actualizar cliente:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// DELETE /api/clientes/:id — apagar (Admin)
// ─────────────────────────────────────────
router.delete('/:id', apenasAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id])
    res.json({ mensagem: 'Cliente apagado.' })
  } catch (err) {
    console.error('Erro ao apagar cliente:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// POST /api/clientes/:id/interacoes — registar interacção
// ─────────────────────────────────────────
router.post('/:id/interacoes', async (req, res) => {
  const { tipo, nota } = req.body
  if (!tipo || !nota) return res.status(400).json({ mensagem: 'Tipo e nota são obrigatórios.' })

  try {
    await db.query(
      'INSERT INTO interacoes (cliente_id, tipo, nota, utilizador_id) VALUES (?,?,?,?)',
      [req.params.id, tipo, nota, req.utilizador.id]
    )
    // Actualiza último contacto
    await db.query(
      'UPDATE clientes SET ultimo_contacto = CURDATE() WHERE id = ?',
      [req.params.id]
    )
    res.status(201).json({ mensagem: 'Interacção registada.' })
  } catch (err) {
    console.error('Erro ao registar interacção:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

module.exports = router
