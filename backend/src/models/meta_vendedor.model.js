// backend/src/models/meta_vendedor.model.js

const db = require('../config/db')

const MetaVendedorModel = {

  // Busca todas as metas de vendedor para um determinado mês
  // Faz JOIN com utilizadores para termos o nome do vendedor
  listarPorMes: async (mesAno) => {
    const [rows] = await db.query(
      `SELECT 
        mv.id,
        mv.vendedor_id,
        mv.meta_reunioes,
        u.nome AS vendedor_nome
       FROM metas_vendedor mv
       JOIN utilizadores u ON mv.vendedor_id = u.id
       WHERE mv.mes_ano = ?
       ORDER BY u.nome ASC`,
      [mesAno]
    )
    return rows
  },

  // Guarda ou actualiza a meta de um vendedor num mês
  // ON DUPLICATE KEY UPDATE porque temos UNIQUE (vendedor_id, mes_ano)
  guardar: async (mesAno, vendedorId, metaReunioes) => {
    await db.query(
      `INSERT INTO metas_vendedor (mes_ano, vendedor_id, meta_reunioes)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE meta_reunioes = VALUES(meta_reunioes)`,
      [mesAno, vendedorId, metaReunioes]
    )
  }
}

module.exports = MetaVendedorModel