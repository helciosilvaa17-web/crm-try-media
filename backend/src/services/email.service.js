// backend/src/services/email.service.js

const nodemailer = require('nodemailer')
const fs         = require('fs')
const path       = require('path')

// ── Transportador SMTP ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

transporter.verify((err) => {
  if (err) {
    console.error('❌ Falha na ligação SMTP:', err.message)
  } else {
    console.log('✅ Serviço de email SMTP ligado com sucesso')
  }
})

// ── Funções auxiliares ────────────────────────────────────────────────────
function preencherTemplate(templatePath, variaveis) {
  let html = fs.readFileSync(templatePath, 'utf8')
  for (const [chave, valor] of Object.entries(variaveis)) {
    html = html.replace(new RegExp(`{{${chave}}}`, 'g'), valor || '—')
  }
  html = html.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '')
  return html
}

function formatarDataHora(dataHora) {
  const d = new Date(dataHora)
  return d.toLocaleString('pt-AO', {
    weekday:  'long',
    day:      '2-digit',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'Africa/Luanda'
  })
}

// ── Email: nova reunião ───────────────────────────────────────────────────
async function enviarEmailNovaReuniao(destinatario, reuniao) {
  const templatePath = path.join(__dirname, '../templates/reuniao-criada.html')

  const variaveis = {
    NOME_VENDEDOR: destinatario.nome,
    TITULO:        reuniao.titulo,
    DATA_HORA:     formatarDataHora(reuniao.data_hora),
    CLIENTE:       reuniao.cliente_nome || 'Não especificado',
    TIPO:          reuniao.tipo         || 'Não especificado',
    FORMATO:       reuniao.formato      || 'Não especificado',
    CANAL:         reuniao.canal        || 'Não especificado',
    ESTADO:        reuniao.estado       || 'agendado',
    NOTAS:         reuniao.notas        || '',
  }

  const html = preencherTemplate(templatePath, variaveis)

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      destinatario.email,
    subject: `📅 Nova Reunião: ${reuniao.titulo} — ${formatarDataHora(reuniao.data_hora)}`,
    html,
  })

  console.log(`📧 Email enviado para ${destinatario.email} — Reunião: "${reuniao.titulo}"`)
}

// ── Email: boas-vindas ao criar utilizador ────────────────────────────────
async function enviarEmailBoasVindas(novoUtilizador, adminEmail) {
  const mensagemUtilizador = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:40px 30px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">👋 Bem-vindo ao CRM TRY MEDIA</h1>
        <p style="color:rgba(255,255,255,0.7);margin-top:8px;font-size:13px">A tua conta foi criada com sucesso</p>
      </div>
      <div style="padding:36px 30px">
        <p style="font-size:16px;color:#444">Olá, <strong>${novoUtilizador.nome}</strong>!</p>
        <p style="color:#555;font-size:14px;line-height:1.7;margin-top:12px">
          A tua conta no <strong>CRM TRY MEDIA</strong> foi criada. Já podes aceder ao sistema com as tuas credenciais.
        </p>
        <div style="background:#f8f9fc;border-radius:10px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.8px">Os teus dados de acesso</p>
          <p style="margin:4px 0;font-size:15px"><strong>Email:</strong> ${novoUtilizador.email}</p>
          <p style="margin:4px 0;font-size:15px"><strong>Perfil:</strong> ${novoUtilizador.perfil}</p>
        </div>
        <div style="text-align:center;margin-top:28px">
          <a href="http://localhost:5173" style="background:#e94560;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Aceder ao CRM →</a>
        </div>
      </div>
      <div style="background:#f8f9fc;border-top:1px solid #eef0f4;padding:20px 30px;text-align:center">
        <p style="font-size:12px;color:#999">CRM TRY MEDIA — email gerado automaticamente</p>
      </div>
    </div>`

  const mensagemAdmin = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:40px 30px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">🆕 Novo Utilizador Registado</h1>
        <p style="color:rgba(255,255,255,0.7);margin-top:8px;font-size:13px">CRM TRY MEDIA — Notificação de sistema</p>
      </div>
      <div style="padding:36px 30px">
        <p style="font-size:15px;color:#555;line-height:1.7">Foi adicionado um novo utilizador ao sistema:</p>
        <div style="background:#f8f9fc;border-radius:10px;padding:20px;margin:20px 0">
          <p style="margin:6px 0;font-size:15px"><strong>Nome:</strong> ${novoUtilizador.nome}</p>
          <p style="margin:6px 0;font-size:15px"><strong>Email:</strong> ${novoUtilizador.email}</p>
          <p style="margin:6px 0;font-size:15px"><strong>Perfil:</strong> ${novoUtilizador.perfil}</p>
          <p style="margin:6px 0;font-size:15px"><strong>Data:</strong> ${new Date().toLocaleString('pt-AO', { timeZone: 'Africa/Luanda' })}</p>
        </div>
      </div>
      <div style="background:#f8f9fc;border-top:1px solid #eef0f4;padding:20px 30px;text-align:center">
        <p style="font-size:12px;color:#999">CRM TRY MEDIA — email gerado automaticamente</p>
      </div>
    </div>`

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      novoUtilizador.email,
    subject: '👋 Bem-vindo ao CRM TRY MEDIA — A tua conta foi criada',
    html:    mensagemUtilizador,
  })

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      adminEmail,
    subject: `🆕 Novo utilizador registado: ${novoUtilizador.nome}`,
    html:    mensagemAdmin,
  })

  console.log(`📧 Emails de boas-vindas enviados para ${novoUtilizador.email} e administrador`)
}

// ── Exportações ───────────────────────────────────────────────────────────
module.exports = {
  enviarEmailNovaReuniao,
  enviarEmailBoasVindas,
}