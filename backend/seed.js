require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('./src/config/db')

async function seed() {
  try {
    console.log('🌱 A iniciar o seed da base de dados...')

    // ─── UTILIZADORES ───
    const hashAdmin    = await bcrypt.hash('admin123',    12)
    const hashVendedor = await bcrypt.hash('vendedor123', 12)

    await db.query(`
      INSERT INTO utilizadores (nome, email, palavra_passe, perfil)
      VALUES
        ('Hélcio Silva', 'helcio@trymedia.ao', ?, 'administrador'),
        ('João Manuel',  'joao@trymedia.ao',   ?, 'vendedor')
    `, [hashAdmin, hashVendedor])

    console.log('✅ Utilizadores criados')

    // ─── BUSCA OS IDs ───
    const [[admin]]    = await db.query("SELECT id FROM utilizadores WHERE email = 'helcio@trymedia.ao'")
    const [[vendedor]] = await db.query("SELECT id FROM utilizadores WHERE email = 'joao@trymedia.ao'")

    // ─── CLIENTES ───
    await db.query(`
      INSERT INTO clientes 
        (nome_empresa, nicho, telefone, whatsapp, valor_estimado, status, prioridade, ultimo_contacto, vendedor_id)
      VALUES
        ('Grupo Alpha',     'Marketing',   '923000001', '923000001', 200000, 'fechado',    'Alto',  '2026-05-12', ?),
        ('MediaX',          'Audiovisual', '923000002', '923000002', 150000, 'negociacao', 'Médio', '2026-05-10', ?),
        ('StartupKilamba',  'Tech',        '923000003', '923000003', 500000, 'progresso',  'Médio', '2026-05-09', ?)
    `, [admin.id, vendedor.id, admin.id])

    console.log('✅ Clientes criados')

    // ─── BUSCA IDs DOS CLIENTES ───
    const [[c1]] = await db.query("SELECT id FROM clientes WHERE nome_empresa = 'Grupo Alpha'")
    const [[c2]] = await db.query("SELECT id FROM clientes WHERE nome_empresa = 'MediaX'")

    // ─── REUNIÕES ───
    await db.query(`
      INSERT INTO reunioes (titulo, cliente_id, data_hora, tipo, notas, criado_por)
      VALUES
        ('Reunião Grupo Alpha', ?, '2026-05-25 12:00:00', 'diagnóstico', 'Apresentar portfólio.', ?),
        ('Follow-up MediaX',    ?, '2026-05-28 09:30:00', 'follow-up',   'Verificar proposta.',   ?)
    `, [c1.id, admin.id, c2.id, vendedor.id])

    console.log('✅ Reuniões criadas')

    // ─── META ───
    await db.query(`
      INSERT INTO metas (mes_ano, meta_faturamento, meta_reunioes, meta_prospeccoes)
      VALUES ('2026-05-01', 2325000, 40, 4)
    `)

    console.log('✅ Metas criadas')

    // ─── INTERACÇÕES ───
    await db.query(`
      INSERT INTO interacoes (cliente_id, tipo, nota, utilizador_id)
      VALUES
        (?, 'reunião',  'Reunião de diagnóstico realizada com sucesso.', ?),
        (?, 'whatsapp', 'Enviada proposta comercial via WhatsApp.',       ?),
        (?, 'email',    'Primeiro contacto por email.',                   ?)
    `, [c1.id, admin.id, c2.id, vendedor.id, c2.id, admin.id])

    console.log('✅ Interacções criadas')

    console.log('')
    console.log('🎉 Seed concluído com sucesso!')
    console.log('─────────────────────────────────')
    console.log('👤 Admin:    helocio@trymedia.ao  |  admin123')
    console.log('👤 Vendedor: joao@trymedia.ao    |  vendedor123')
    console.log('─────────────────────────────────')

    process.exit(0)
  } catch (err) {
    console.error('❌ Erro no seed:', err.message)
    process.exit(1)
  }
}

seed()