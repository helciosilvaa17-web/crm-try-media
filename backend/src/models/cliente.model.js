const db = require('../config/db')

const ClienteModel = {
    listar: async (filtros = {}) => {
        let sql = `SELECT c.*, u.nome AS vendedor_nome FROM clientes c LEFT JOIN utilizadores u ON c.vendedor_id = u.id WHERE 1=1`
        const params = []
        if (filtros.vendedor_id) { sql += ' AND c.vendedor_id = ?'; params.push(filtros.vendedor_id) }
        if (filtros.status) { sql += ' AND c.status = ?'; params.push(filtros.status) }
        if (filtros.pesquisa) { sql += ' AND (c.nome_empresa LIKE ? OR c.nicho LIKE ?)'; params.push(`%${filtros.pesquisa}%`, `%${filtros.pesquisa}%`) }
        sql += ' ORDER BY c.criado_em DESC'
        const [rows] = await db.query(sql, params)
        return rows
    },

    encontrarPorId: async (id) => {
        const [rows] = await db.query(`SELECT c.*, u.nome AS vendedor_nome FROM clientes c LEFT JOIN utilizadores u ON c.vendedor_id = u.id WHERE c.id = ?`, [id])
        return rows[0]
    },
    criar: async (dados) => {
        const [result] = await db.query(
            `INSERT INTO clientes (nome_empresa, nicho, telefone, email, whatsapp, valor_estimado, status, prioridade, ultimo_contacto, fecho_previsto, link_info, observacoes, vendedor_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [dados.nome_empresa, dados.nicho, dados.telefone, dados.email, dados.whatsapp, dados.valor_estimado || 0, dados.status, dados.prioridade || 'médio', dados.ultimo_contacto || null, dados.fecho_previsto || null, dados.link_info, dados.observacoes, dados.vendedor_id]
        )
        return result.insertId
    },
}