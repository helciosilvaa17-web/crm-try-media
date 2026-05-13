const cron = require('node-cron')
const db = require('../config/db')
const { enviarLembrete } = require('./email.service')

function iniciarLembretes() {
  // Corre a cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      const [reunioes] = await db.query(`
        SELECT
          r.*,
          c.nome_empresa  AS cliente_nome,
          criador.nome    AS criador_nome,
          criador.email   AS criador_email,
          resp.nome       AS resp_nome,
          resp.email      AS resp_email
        FROM reunioes r
        LEFT JOIN clientes      c       ON r.cliente_id          = c.id
        LEFT JOIN utilizadores  criador ON r.criado_por          = criador.id
        LEFT JOIN utilizadores  resp    ON r.responsavel_trymedia = resp.id
        WHERE r.lembrete_enviado = 0
          AND r.lembrete_antecedencia IS NOT NULL
          AND NOW() >= DATE_SUB(r.data_hora, INTERVAL r.lembrete_antecedencia MINUTE)
          AND r.data_hora > NOW()
      `)

      for (const reuniao of reunioes) {
        // Colecta e-mails únicos (pode ser a mesma pessoa nos dois papéis)
        const emails = new Set()
        if (reuniao.criador_email) emails.add(reuniao.criador_email)
        if (reuniao.resp_email)    emails.add(reuniao.resp_email)

        if (emails.size > 0) {
          await enviarLembrete(reuniao, [...emails])
          await db.query(
            'UPDATE reunioes SET lembrete_enviado = 1 WHERE id = ?',
            [reuniao.id]
          )
          console.log(`⏰ Lembrete enviado para a reunião #${reuniao.id} — ${reuniao.titulo}`)
        }
      }
    } catch (err) {
      console.error('Erro no cron de lembretes:', err.message)
    }
  })

  console.log('✅ Serviço de lembretes iniciado.')
}

module.exports = { iniciarLembretes }