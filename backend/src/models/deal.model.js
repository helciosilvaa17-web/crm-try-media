const db = require('../config/db')

const DealModel = {

  listar: async (filtros = {}) => {
    let sql = `
      SELECT d.*, u.nome AS vendedor_nome
      FROM deals d
      LEFT JOIN utilizadores u ON d.vendedor_id = u.id
      WHERE 1=1
    `
    const params = []
    if (filtros.vendedor_id) {
      sql += ' AND d.vendedor_id = ?'
      params.push(filtros.vendedor_id)
    }
    if (filtros.mes && filtros.ano) {
      sql += ' AND MONTH(d.data_deal) = ? AND YEAR(d.data_deal) = ?'
      params.push(filtros.mes, filtros.ano)
    }
    sql += ' ORDER BY d.data_deal DESC'
    const [rows] = await db.query(sql, params)
    return rows
  },

  criar: async (dados) => {
    const [result] = await db.query(
      `INSERT INTO deals (descricao, cliente_nome, servico, valor, data_deal, vendedor_id, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.descricao, dados.cliente_nome, dados.servico,
        dados.valor, dados.data_deal,
        dados.vendedor_id || null, dados.notas || null
      ]
    )
    return result.insertId
  },

  apagar: async (id) => {
    await db.query('DELETE FROM deals WHERE id = ?', [id])
  },

  // Usado pelo dashboard e relatórios
  totalFaturado: async (mes = null, ano = null) => {
    let sql = 'SELECT COALESCE(SUM(valor), 0) AS total FROM deals WHERE 1=1'
    const params = []
    if (mes && ano) {
      sql += ' AND MONTH(data_deal) = ? AND YEAR(data_deal) = ?'
      params.push(mes, ano)
    }
    const [[{ total }]] = await db.query(sql, params)
    return Number(total)
  }
}

module.exports = DealModel