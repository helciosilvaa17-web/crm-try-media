const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function formatDataHora(str) {
  const d = new Date(str)
  return d.toLocaleDateString('pt-AO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  }) + ' às ' + d.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
}

async function enviarConfirmacao(reuniao, destinatarios) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a1f0e;color:#d7fcea;border-radius:12px;overflow:hidden;">
      <div style="background:#08160e;padding:28px 32px;">
        <h1 style="margin:0;font-size:22px;color:#e6fff6;">Reunião Agendada</h1>
      </div>
      <div style="padding:32px;">
        <p>Olá, <strong>${r.responsavel_trymedia}</strong></p>
        <p>A reunião: <strong>${reuniao.titulo}</strong> foi agendada com sucesso.</p>
        <div style="background:#08160e;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:8px 0;"><strong>Data:</strong> ${formatDataHora(reuniao.data_hora)}</p>
          <p style="margin:8px 0;"><strong>Cliente:</strong> ${reuniao.cliente_nome || '—'}</p>
          <p style="margin:8px 0;"><strong>Tipo:</strong> ${reuniao.tipo}</p>
          <p style="margin:8px 0;"><strong>Formato:</strong> ${reuniao.formato}</p>
          ${reuniao.notas ? `<p style="margin:8px 0;">📝 <strong>Notas:</strong> ${reuniao.notas}</p>` : ''}
        </div>
        <p style="color:#aaa;font-size:13px;">Este é um e-mail automático do CRM TRY MEDIA.</p>
      </div>
    </div>
  `
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destinatarios.join(', '),
    subject: `✅ Reunião Agendada: ${reuniao.titulo}`,
    html,
  })
}

async function enviarLembrete(reuniao, destinatarios) {
  const minutos = reuniao.lembrete_antecedencia
  const tempoTexto = minutos >= 1440
    ? `${minutos / 1440} dia(s)`
    : minutos >= 60
      ? `${minutos / 60} hora(s)`
      : `${minutos} minutos`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a1f0e;color:#d7fcea;border-radius:12px;overflow:hidden;">
      <div style="background:#08160e;padding:28px 32px;">
        <h1 style="margin:0;font-size:22px;color:#e6fff6;">Lembrete de Reunião</h1>
      </div>
      <div style="padding:32px;">
        <p>Olá,<strong>${r.responsavel_trymedia}</strong></p>
        <p>A tua reunião <strong>${reuniao.titulo}</strong> começa em <strong>${tempoTexto}</strong>!</p>
        <div style="background:#0d3320;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:8px 0;">📅 <strong>Data:</strong> ${formatDataHora(reuniao.data_hora)}</p>
          <p style="margin:8px 0;"><strong>Cliente:</strong> ${reuniao.cliente_nome || '—'}</p>
          <p style="margin:8px 0;"><strong>Tipo:</strong> ${reuniao.tipo}</p>
          <p style="margin:8px 0;"><strong>Formato:</strong> ${reuniao.formato}</p>
        </div>
        <p style="color:#aaa;font-size:13px;">Este é um e-mail automático do CRM TRY MEDIA.</p>
      </div>
    </div>
  `
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destinatarios.join(', '),
    subject: `⏰ Lembrete: ${reuniao.titulo} em ${tempoTexto}`,
    html,
  })
}

module.exports = { enviarConfirmacao, enviarLembrete }