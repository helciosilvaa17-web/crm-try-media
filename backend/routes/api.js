const express = require('express')
const db      = require('../db')
const { autenticar, apenasAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(autenticar)

// ─────────────────────────────────────────
// GET /api/dashboard — KPIs e resumo
// ─────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const vendedorId = req.utilizador.perfil === 'vendedor' ? req.utilizador.id : null
    const filtroVendedor = vendedorId ? 'AND vendedor_id = ?' : ''
    const params = vendedorId ? [vendedorId] : []

    // Total leads
    const [[{ totalLeads }]] = await db.query(
      `SELECT COUNT(*) AS totalLeads FROM clientes WHERE 1=1 ${filtroVendedor}`, params
    )

    // Fechados este mês
    const [[{ fechados }]] = await db.query(
      `SELECT COUNT(*) AS fechados FROM clientes
       WHERE status = 'fechado'
       AND MONTH(ultimo_contacto) = MONTH(CURDATE())
       AND YEAR(ultimo_contacto) = YEAR(CURDATE())
       ${filtroVendedor}`, params
    )

    // Em negociação
    const [[{ emNegociacao }]] = await db.query(
      `SELECT COUNT(*) AS emNegociacao FROM clientes WHERE status = 'negociacao' ${filtroVendedor}`, params
    )

    // Valor pipeline
    const [[{ valorPipeline }]] = await db.query(
      `SELECT COALESCE(SUM(valor_estimado), 0) AS valorPipeline FROM clientes WHERE 1=1 ${filtroVendedor}`, params
    )

    // Contactar hoje (último contacto há mais de 7 dias ou nunca contactado)
    const [contactarHoje] = await db.query(
      `SELECT id, nome_empresa AS empresa, nicho, whatsapp AS telefone
       FROM clientes
       WHERE (ultimo_contacto IS NULL OR ultimo_contacto <= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
       AND status NOT IN ('fechado')
       ${filtroVendedor}
       LIMIT 5`, params
    )

    // Funil
    const [funil] = await db.query(
      `SELECT status, COUNT(*) AS qtd FROM clientes WHERE 1=1 ${filtroVendedor} GROUP BY status`, params
    )

    // Meta do mês
    const [[meta]] = await db.query(
      `SELECT meta_faturamento, meta_reunioes, meta_prospeccoes
       FROM metas WHERE mes_ano = DATE_FORMAT(CURDATE(), '%Y-%m-01')
       ORDER BY id DESC LIMIT 1`
    )

    // Faturamento realizado (fechados este mês)
    const [[{ realizado }]] = await db.query(
      `SELECT COALESCE(SUM(valor_estimado), 0) AS realizado FROM clientes
       WHERE status = 'fechado'
       AND MONTH(ultimo_contacto) = MONTH(CURDATE())
       AND YEAR(ultimo_contacto) = YEAR(CURDATE())
       ${filtroVendedor}`, params
    )

    // Próximas reuniões
    const filtroReuniao = vendedorId ? 'AND criado_por = ?' : ''
    const paramsReuniao = vendedorId ? [vendedorId] : []
    const [reunioes] = await db.query(
      `SELECT r.id, r.titulo, r.data_hora, r.tipo, c.nome_empresa AS cliente
       FROM reunioes r
       LEFT JOIN clientes c ON r.cliente_id = c.id
       WHERE r.data_hora >= NOW()
       ${filtroReuniao}
       ORDER BY r.data_hora ASC LIMIT 5`, paramsReuniao
    )

    res.json({
      kpis: {
        totalLeads,
        fechados,
        emNegociacao,
        valorPipeline: Number(valorPipeline)
      },
      contactarHoje,
      funil,
      meta: {
        realizado: Number(realizado),
        total: meta?.meta_faturamento || 0
      },
      reunioes
    })
  } catch (err) {
    console.error('Erro no dashboard:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// GET /api/relatorios — só Admin
// ─────────────────────────────────────────
router.get('/relatorios', apenasAdmin, async (req, res) => {
  try {
    const { mes, ano } = req.query
    const mesAtual  = mes  || new Date().getMonth() + 1
    const anoAtual  = ano  || new Date().getFullYear()

    // Faturamento do mês
    const [[{ faturamento }]] = await db.query(
      `SELECT COALESCE(SUM(valor_estimado), 0) AS faturamento
       FROM clientes
       WHERE status = 'fechado'
       AND MONTH(ultimo_contacto) = ? AND YEAR(ultimo_contacto) = ?`,
      [mesAtual, anoAtual]
    )

    // Meta
    const [[metaRow]] = await db.query(
      `SELECT meta_faturamento, meta_reunioes, meta_prospeccoes
       FROM metas
       WHERE MONTH(mes_ano) = ? AND YEAR(mes_ano) = ?
       LIMIT 1`,
      [mesAtual, anoAtual]
    )

    // Pipeline por fase
    const [pipeline] = await db.query(
      `SELECT status AS fase, COUNT(*) AS qtd, COALESCE(SUM(valor_estimado),0) AS valor
       FROM clientes GROUP BY status`
    )

    // Total leads do mês
    const [[{ totalLeads }]] = await db.query(
      `SELECT COUNT(*) AS totalLeads FROM clientes
       WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?`,
      [mesAtual, anoAtual]
    )

    // Reuniões agendadas no mês
    const [[{ reunioesAgendadas }]] = await db.query(
      `SELECT COUNT(*) AS reunioesAgendadas FROM reunioes
       WHERE MONTH(data_hora) = ? AND YEAR(data_hora) = ?`,
      [mesAtual, anoAtual]
    )

    res.json({
      faturamento: Number(faturamento),
      meta: metaRow?.meta_faturamento || 0,
      pipeline,
      metricas: { totalLeads, reunioesAgendadas }
    })
  } catch (err) {
    console.error('Erro nos relatórios:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// PUT /api/configuracoes/metas — só Admin
// ─────────────────────────────────────────
router.put('/configuracoes/metas', apenasAdmin, async (req, res) => {
  const { faturamento, reunioes, prospeccoes } = req.body
  try {
    const mesAno = new Date().toISOString().slice(0, 7) + '-01'
    await db.query(
      `INSERT INTO metas (mes_ano, meta_faturamento, meta_reunioes, meta_prospeccoes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         meta_faturamento = VALUES(meta_faturamento),
         meta_reunioes    = VALUES(meta_reunioes),
         meta_prospeccoes = VALUES(meta_prospeccoes)`,
      [mesAno, faturamento, reunioes, prospeccoes]
    )
    res.json({ mensagem: 'Metas guardadas.' })
  } catch (err) {
    console.error('Erro ao guardar metas:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// ─────────────────────────────────────────
// GET /api/utilizadores — só Admin
// ─────────────────────────────────────────
router.get('/utilizadores', apenasAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, perfil, criado_em FROM utilizadores ORDER BY criado_em DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar utilizadores:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// DELETE /api/utilizadores/:id — só Admin
router.delete('/utilizadores/:id', apenasAdmin, async (req, res) => {
  try {
    if (req.params.id == req.utilizador.id) {
      return res.status(400).json({ mensagem: 'Não podes remover a tua própria conta.' })
    }
    await db.query('DELETE FROM utilizadores WHERE id = ?', [req.params.id])
    res.json({ mensagem: 'Utilizador removido.' })
  } catch (err) {
    console.error('Erro ao remover utilizador:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

// PUT /api/perfil — actualiza dados do próprio utilizador
router.put('/perfil', async (req, res) => {
  const bcrypt = require('bcryptjs')
  const { nome, email, senhaAtual, novaSenha } = req.body
  try {
    if (novaSenha) {
      const [[user]] = await db.query('SELECT palavra_passe FROM utilizadores WHERE id = ?', [req.utilizador.id])
      const ok = await bcrypt.compare(senhaAtual, user.palavra_passe)
      if (!ok) return res.status(400).json({ mensagem: 'Senha actual incorrecta.' })
      const hash = await bcrypt.hash(novaSenha, 12)
      await db.query('UPDATE utilizadores SET nome=?, email=?, palavra_passe=? WHERE id=?',
        [nome, email, hash, req.utilizador.id])
    } else {
      await db.query('UPDATE utilizadores SET nome=?, email=? WHERE id=?',
        [nome, email, req.utilizador.id])
    }
    res.json({ mensagem: 'Perfil actualizado.' })
  } catch (err) {
    console.error('Erro ao actualizar perfil:', err)
    res.status(500).json({ mensagem: 'Erro interno.' })
  }
})

module.exports = router
