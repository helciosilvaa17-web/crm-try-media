const db = require('../config/db')

const MetaModel = {
  obterMesAtual: async () => {
    const [[row]] = await db.query(`SELECT meta_faturamento, meta_reunioes, meta_prospeccoes FROM metas WHERE mes_ano = DATE_FORMAT(CURDATE(), '%Y-%m-01') ORDER BY id DESC LIMIT 1`)
    return row
  },
  guardar: async (mesAno, faturamento, reunioes, prospeccoes) => {
    await db.query(
      `INSERT INTO metas (mes_ano, meta_faturamento, meta_reunioes, meta_prospeccoes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE meta_faturamento=VALUES(meta_faturamento), meta_reunioes=VALUES(meta_reunioes), meta_prospeccoes=VALUES(meta_prospeccoes)`,
      [mesAno, faturamento, reunioes, prospeccoes]
    )
  }
}

module.exports = MetaModel