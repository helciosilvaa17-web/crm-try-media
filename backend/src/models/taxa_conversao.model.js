// backend/src/models/taxa_conversao.model.js

const db = require('../config/db')

const TaxaConversaoModel = {

  obterPorMes: async (mesAno) => {
    const [[row]] = await db.query(
      'SELECT * FROM taxas_conversao WHERE mes_ano = ? LIMIT 1',
      [mesAno]
    )
    return row || null
  },

  guardar: async (mesAno, taxas) => {
    await db.query(
      `INSERT INTO taxas_conversao 
        (mes_ano, taxa_conexao, taxa_agendamento, taxa_realizacao, taxa_fechamento)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        taxa_conexao      = VALUES(taxa_conexao),
        taxa_agendamento  = VALUES(taxa_agendamento),
        taxa_realizacao   = VALUES(taxa_realizacao),
        taxa_fechamento   = VALUES(taxa_fechamento)`,
      [
        mesAno,
        taxas.taxa_conexao,
        taxas.taxa_agendamento,
        taxas.taxa_realizacao,
        taxas.taxa_fechamento
      ]
    )
  }
}

module.exports = TaxaConversaoModel