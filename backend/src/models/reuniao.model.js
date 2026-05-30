// backend/src/models/reuniao.model.js

const db = require('../config/db')

const ReuniaoModel = {

  listar: async (filtros = {}) => {
    let sql = `
      SELECT
        r.*,
        c.nome_empresa AS cliente_nome_bd,
        COALESCE(c.nome_empresa, r.cliente_nome_livre) AS cliente_nome,
        u.nome AS criado_por_nome,
        resp.nome AS responsavel_trymedia_nome
      FROM reunioes r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      LEFT JOIN utilizadores u ON r.criado_por = u.id
      LEFT JOIN utilizadores resp ON r.responsavel_trymedia = resp.id
      WHERE 1=1
    `

    const params = []

    if (filtros.criado_por) {
      sql += ' AND r.criado_por = ?'
      params.push(filtros.criado_por)
    }

    if (filtros.mes && filtros.ano) {
      sql += ' AND MONTH(r.data_hora) = ? AND YEAR(r.data_hora) = ?'
      params.push(filtros.mes, filtros.ano)
    }

    if (filtros.estado) {
      sql += ' AND r.estado = ?'
      params.push(filtros.estado)
    }

    sql += ' ORDER BY r.data_hora ASC'

    const [rows] = await db.query(sql, params)

    return rows
  },

  criar: async (dados) => {

    const [result] = await db.query(
      `
      INSERT INTO reunioes (
        titulo,
        cliente_id,
        cliente_nome_livre,
        data_hora,
        tipo,
        notas,
        canal,
        responsavel_empresa,
        estado,
        formato,
        responsavel_trymedia,
        criado_por,
        lembrete_antecedencia
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        dados.titulo,
        dados.cliente_id || null,
        dados.cliente_nome_livre || null,
        dados.data_hora,
        dados.tipo,
        dados.notas || null,
        dados.canal || null,
        dados.responsavel_empresa || null,
        dados.estado || 'agendada',
        dados.formato || 'online',
        dados.responsavel_trymedia || null,
        dados.criado_por,
        dados.lembrete_antecedencia || null
      ]
    )

    return result.insertId
  },

  atualizar: async (id, dados) => {

    await db.query(
      `
      UPDATE reunioes SET
        titulo = ?,
        cliente_id = ?,
        cliente_nome_livre = ?,
        data_hora = ?,
        tipo = ?,
        notas = ?,
        canal = ?,
        responsavel_empresa = ?,
        estado = ?,
        formato = ?,
        responsavel_trymedia = ?,
        lembrete_antecedencia = ?,
        lembrete_enviado = 0
      WHERE id = ?
      `,
      [
        dados.titulo,
        dados.cliente_id || null,
        dados.cliente_nome_livre || null,
        dados.data_hora,
        dados.tipo,
        dados.notas || null,
        dados.canal || null,
        dados.responsavel_empresa || null,
        dados.estado,
        dados.formato,
        dados.responsavel_trymedia || null,
        dados.lembrete_antecedencia || null,
        id
      ]
    )
  },

  apagar: async (id) => {
    await db.query(
      'DELETE FROM reunioes WHERE id = ?',
      [id]
    )
  },

  buscarPorId: async (id) => {

  const [rows] = await db.query(`
    SELECT
      r.*,
      c.nome_empresa AS cliente_nome,
      u.nome AS criado_por_nome,
      resp.nome AS responsavel_trymedia_nome
    FROM reunioes r
    LEFT JOIN clientes c ON c.id = r.cliente_id
    LEFT JOIN utilizadores u ON u.id = r.criado_por
    LEFT JOIN utilizadores resp ON resp.id = r.responsavel_trymedia
    WHERE r.id = ?
    LIMIT 1
  `, [id])

  return rows[0]
}

}

module.exports = ReuniaoModel