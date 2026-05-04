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

    atualizar: async (id, dados) => {
        await db.query(
            `UPDATE clientes SET nome_empresa=?, nicho=?, telefone=?, email=?, whatsapp=?, valor_estimado=?, status=?, prioridade=?, ultimo_contacto=?, fecho_previsto=?, link_info=?, observacoes=?, vendedor_id=? WHERE id=?`,
            [dados.nome_empresa, dados.nicho, dados.telefone, dados.email, dados.whatsapp, dados.valor_estimado, dados.status, dados.prioridade, dados.ultimo_contacto, dados.fecho_previsto, dados.link_info, dados.observacoes, dados.vendedor_id, id]
        )
    },
    apagar: async (id) => {
        await db.query('DELETE FROM clientes WHERE id = ?', [id])
    },
    listarInteracoes: async (clienteId) => {
        const [rows] = await db.query(`SELECT i.*, u.nome AS utilizador_nome FROM interacoes i LEFT JOIN utilizadores u ON i.utilizador_id = u.id WHERE i.cliente_id = ? ORDER BY i.data DESC`, [clienteId])
        return rows
    },
    criarInteracao: async (clienteId, tipo, nota, utilizadorId) => {
        await db.query('INSERT INTO interacoes (cliente_id, tipo, nota, utilizador_id) VALUES (?,?,?,?)', [clienteId, tipo, nota, utilizadorId])
        await db.query('UPDATE clientes SET ultimo_contacto = CURDATE() WHERE id = ?', [clienteId])
    }
}