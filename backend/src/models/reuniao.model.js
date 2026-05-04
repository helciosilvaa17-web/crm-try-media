const db = require('../config/db')

const ReuniaoModel = {
  listar: async (filtros = {}) => {
    let sql = `SELECT r.*, c.nome_empresa AS cliente_nome, u.nome AS criado_por_nome FROM reunioes r LEFT JOIN clientes c ON r.cliente_id = c.id LEFT JOIN utilizadores u ON r.criado_por = u.id WHERE 1=1`
    const params = []
    if (filtros.criado_por) { sql += ' AND r.criado_por = ?'; params.push(filtros.criado_por) }
    if (filtros.mes && filtros.ano) { sql += ' AND MONTH(r.data_hora) = ? AND YEAR(r.data_hora) = ?'; params.push(filtros.mes, filtros.ano) }
    sql += ' ORDER BY r.data_hora ASC'
    const [rows] = await db.query(sql, params)
    return rows
  },
  criar: async (dados) => {
    const [result] = await db.query(
      'INSERT INTO reunioes (titulo, cliente_id, data_hora, tipo, notas, criado_por) VALUES (?,?,?,?,?,?)',
      [dados.titulo, dados.cliente_id || null, dados.data_hora, dados.tipo || 'diagnóstico', dados.notas || '', dados.criado_por]
    )
    return result.insertId
  },
  atualizar: async (id, dados) => {
    await db.query('UPDATE reunioes SET titulo=?, cliente_id=?, data_hora=?, tipo=?, notas=? WHERE id=?', [dados.titulo, dados.cliente_id, dados.data_hora, dados.tipo, dados.notas, id])
  },
  apagar: async (id) => {
    await db.query('DELETE FROM reunioes WHERE id = ?', [id])
  }
}

module.exports = ReuniaoModel