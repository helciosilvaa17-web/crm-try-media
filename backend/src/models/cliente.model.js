const db = require('../config/db')

const ClienteModel = {
    listar: async (filtros = {}) => {
        let sql = `SELECT c.*, u.nome AS vendedor_nome FROM clientes c LEFT JOIN utilizadores u ON c.vendedor_id = u.id WHERE 1=1`
    const params = []
    if (filtros.vendedor_id) { sql += ' AND c.vendedor_id = ?'; params.push(filtros.vendedor_id) }
    if (filtros.status)      { sql += ' AND c.status = ?';     params.push(filtros.status) }
    if (filtros.pesquisa)    { sql += ' AND (c.nome_empresa LIKE ? OR c.nicho LIKE ?)'; params.push(`%${filtros.pesquisa}%`, `%${filtros.pesquisa}%`) }
    sql += ' ORDER BY c.criado_em DESC'
    const [rows] = await db.query(sql, params)
    return rows
    },
}