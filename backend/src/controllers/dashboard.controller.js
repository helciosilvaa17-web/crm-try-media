// backend/src/controllers/dashboard.controller.js
// Substitui o ficheiro completo

const db = require('../config/db')
const MetaModel          = require('../models/meta.model')
const MetaVendedorModel  = require('../models/meta_vendedor.model')
const TaxaConversaoModel = require('../models/taxa_conversao.model')

const DashboardController = {

  // ─────────────────────────────────────────
  // GET /api/dashboard
  // ─────────────────────────────────────────
  obterDashboard: async (req, res) => {
    try {
      const vendedorId = req.utilizador.perfil === 'vendedor' ? req.utilizador.id : null
      const filtroVendedor = vendedorId ? 'AND vendedor_id = ?' : ''
      const params = vendedorId ? [vendedorId] : []

      const [[{ totalLeads }]] = await db.query(
        `SELECT COUNT(*) AS totalLeads FROM clientes WHERE 1=1 ${filtroVendedor}`, params
      )
      const [[{ fechados }]] = await db.query(
        `SELECT COUNT(*) AS fechados FROM clientes
         WHERE status = 'fechado'
         AND MONTH(ultimo_contacto) = MONTH(CURDATE())
         AND YEAR(ultimo_contacto)  = YEAR(CURDATE())
         ${filtroVendedor}`, params
      )
      const [[{ emNegociacao }]] = await db.query(
        `SELECT COUNT(*) AS emNegociacao FROM clientes
         WHERE status = 'negociacao' ${filtroVendedor}`, params
      )
      const [[{ valorPipeline }]] = await db.query(
        `SELECT COALESCE(SUM(valor_estimado), 0) AS valorPipeline
         FROM clientes WHERE 1=1 ${filtroVendedor}`, params
      )
      const [contactarHoje] = await db.query(
        `SELECT id, nome_empresa AS empresa, nicho, whatsapp AS telefone
         FROM clientes
         WHERE (ultimo_contacto IS NULL OR ultimo_contacto <= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
         AND status NOT IN ('fechado')
         ${filtroVendedor}
         LIMIT 5`, params
      )
      const [funil] = await db.query(
        `SELECT status, COUNT(*) AS qtd FROM clientes
         WHERE 1=1 ${filtroVendedor} GROUP BY status`, params
      )
      const meta = await MetaModel.obterMesAtual()
      const [[{ realizado }]] = await db.query(
        `SELECT COALESCE(SUM(valor_estimado), 0) AS realizado FROM clientes
         WHERE status = 'fechado'
         AND MONTH(ultimo_contacto) = MONTH(CURDATE())
         AND YEAR(ultimo_contacto)  = YEAR(CURDATE())
         ${filtroVendedor}`, params
      )
      const filtroReuniao = vendedorId ? 'AND criado_por = ?' : ''
      const paramsReuniao = vendedorId ? [vendedorId] : []
      const [reunioes] = await db.query(
        `SELECT r.id, r.titulo, r.data_hora, r.tipo, c.nome_empresa AS cliente
         FROM reunioes r
         LEFT JOIN clientes c ON r.cliente_id = c.id
         WHERE r.data_hora >= NOW()
         ${filtroReuniao}
         ORDER BY r.data_hora ASC LIMIT 5`, paramsReuniao
      )

      res.json({
        kpis: { totalLeads, fechados, emNegociacao, valorPipeline: Number(valorPipeline) },
        contactarHoje,
        funil,
        meta: { realizado: Number(realizado), total: meta?.meta_faturamento || 0 },
        reunioes
      })
    } catch (err) {
      console.error('Erro no dashboard:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // GET /api/relatorios
  // Vista global — resumo de toda a equipa
  // ─────────────────────────────────────────
  obterRelatorios: async (req, res) => {
    try {
      const { mes, ano } = req.query
      const mesAtual = mes || new Date().getMonth() + 1
      const anoAtual = ano || new Date().getFullYear()
      const mesAno   = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`

      const [[{ faturamento }]] = await db.query(
        `SELECT COALESCE(SUM(valor_estimado), 0) AS faturamento
         FROM clientes WHERE status = 'fechado'
         AND MONTH(ultimo_contacto) = ? AND YEAR(ultimo_contacto) = ?`,
        [mesAtual, anoAtual]
      )

      const [[metaRow]] = await db.query(
        `SELECT meta_faturamento, meta_reunioes, meta_prospeccoes
         FROM metas WHERE MONTH(mes_ano) = ? AND YEAR(mes_ano) = ? LIMIT 1`,
        [mesAtual, anoAtual]
      )

      const [pipeline] = await db.query(
        `SELECT status AS fase, COUNT(*) AS qtd, COALESCE(SUM(valor_estimado),0) AS valor
         FROM clientes GROUP BY status`
      )

      const [[{ totalLeads }]] = await db.query(
        `SELECT COUNT(*) AS totalLeads FROM clientes
         WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?`,
        [mesAtual, anoAtual]
      )

      const [[{ reunioesAgendadas }]] = await db.query(
        `SELECT COUNT(*) AS reunioesAgendadas FROM reunioes
         WHERE MONTH(data_hora) = ? AND YEAR(data_hora) = ?`,
        [mesAtual, anoAtual]
      )

      // Reuniões realizadas (para calcular taxa de realização)
      const [[{ reunioesRealizadas }]] = await db.query(
        `SELECT COUNT(*) AS reunioesRealizadas FROM reunioes
         WHERE estado = 'realizada'
         AND MONTH(data_hora) = ? AND YEAR(data_hora) = ?`,
        [mesAtual, anoAtual]
      )

      // Taxas esperadas para este mês
      const taxasEsperadas = await TaxaConversaoModel.obterPorMes(mesAno)

      // Resumo por vendedor — para a tabela de vendedores
      const [vendedores] = await db.query(
        `SELECT 
          u.id,
          u.nome,
          COUNT(DISTINCT c.id)                                         AS total_clientes,
          SUM(CASE WHEN c.status = 'fechado' 
              AND MONTH(c.ultimo_contacto) = ?
              AND YEAR(c.ultimo_contacto)  = ?
              THEN 1 ELSE 0 END)                                       AS fechados_mes,
          COALESCE(SUM(CASE WHEN c.status = 'fechado'
              AND MONTH(c.ultimo_contacto) = ?
              AND YEAR(c.ultimo_contacto)  = ?
              THEN c.valor_estimado ELSE 0 END), 0)                    AS faturamento_mes,
          COUNT(DISTINCT r.id)                                         AS reunioes_mes
         FROM utilizadores u
         LEFT JOIN clientes c   ON c.vendedor_id = u.id
         LEFT JOIN reunioes r   ON r.criado_por  = u.id
           AND MONTH(r.data_hora) = ?
           AND YEAR(r.data_hora)  = ?
         WHERE u.perfil = 'vendedor'
         GROUP BY u.id, u.nome
         ORDER BY faturamento_mes DESC`,
        [mesAtual, anoAtual, mesAtual, anoAtual, mesAtual, anoAtual]
      )

      res.json({
        faturamento:      Number(faturamento),
        meta:             metaRow?.meta_faturamento || 0,
        pipeline,
        metricas: {
          totalLeads,
          reunioesAgendadas,
          reunioesRealizadas
        },
        taxasEsperadas,
        vendedores
      })
    } catch (err) {
      console.error('Erro nos relatórios:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // GET /api/relatorios/vendedor/:id
  // Vista individual de um vendedor
  // ─────────────────────────────────────────
  obterRelatorioVendedor: async (req, res) => {
    try {
      const vendedorId = req.params.id
      const { mes, ano } = req.query
      const mesAtual = mes || new Date().getMonth() + 1
      const anoAtual = ano || new Date().getFullYear()

      // Nome do vendedor
      const [[vendedor]] = await db.query(
        'SELECT id, nome, email, criado_em FROM utilizadores WHERE id = ?',
        [vendedorId]
      )
      if (!vendedor) {
        return res.status(404).json({ mensagem: 'Vendedor não encontrado.' })
      }

      // Clientes deste vendedor
      const [[{ totalClientes }]] = await db.query(
        'SELECT COUNT(*) AS totalClientes FROM clientes WHERE vendedor_id = ?',
        [vendedorId]
      )

      // Fechados este mês
      const [[{ fechadosMes }]] = await db.query(
        `SELECT COUNT(*) AS fechadosMes FROM clientes
         WHERE vendedor_id = ? AND status = 'fechado'
         AND MONTH(ultimo_contacto) = ? AND YEAR(ultimo_contacto) = ?`,
        [vendedorId, mesAtual, anoAtual]
      )

      // Faturamento deste mês
      const [[{ faturamentoMes }]] = await db.query(
        `SELECT COALESCE(SUM(valor_estimado), 0) AS faturamentoMes
         FROM clientes
         WHERE vendedor_id = ? AND status = 'fechado'
         AND MONTH(ultimo_contacto) = ? AND YEAR(ultimo_contacto) = ?`,
        [vendedorId, mesAtual, anoAtual]
      )

      // Pipeline deste vendedor
      const [pipeline] = await db.query(
        `SELECT status AS fase, COUNT(*) AS qtd, COALESCE(SUM(valor_estimado),0) AS valor
         FROM clientes WHERE vendedor_id = ? GROUP BY status`,
        [vendedorId]
      )

      // Reuniões deste mês
      const [[{ reunioesAgendadas }]] = await db.query(
        `SELECT COUNT(*) AS reunioesAgendadas FROM reunioes
         WHERE criado_por = ?
         AND MONTH(data_hora) = ? AND YEAR(data_hora) = ?`,
        [vendedorId, mesAtual, anoAtual]
      )

      const [[{ reunioesRealizadas }]] = await db.query(
        `SELECT COUNT(*) AS reunioesRealizadas FROM reunioes
         WHERE criado_por = ? AND estado = 'realizada'
         AND MONTH(data_hora) = ? AND YEAR(data_hora) = ?`,
        [vendedorId, mesAtual, anoAtual]
      )

      // Meta de reuniões deste vendedor neste mês
      const mesAno = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`
      const metasVendedor = await MetaVendedorModel.listarPorMes(mesAno)
      const metaVendedor = metasVendedor.find(m => m.vendedor_id == vendedorId)

      // Últimas interacções deste vendedor
      const [ultimasInteracoes] = await db.query(
        `SELECT i.tipo, i.nota, i.data, c.nome_empresa AS cliente
         FROM interacoes i
         JOIN clientes c ON i.cliente_id = c.id
         WHERE i.utilizador_id = ?
         ORDER BY i.data DESC
         LIMIT 10`,
        [vendedorId]
      )

      res.json({
        vendedor,
        metricas: {
          totalClientes,
          fechadosMes,
          faturamentoMes:    Number(faturamentoMes),
          reunioesAgendadas,
          reunioesRealizadas,
          metaReunioes:      metaVendedor?.meta_reunioes || 0
        },
        pipeline,
        ultimasInteracoes
      })
    } catch (err) {
      console.error('Erro no relatório do vendedor:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // PUT /api/configuracoes/metas
  // ─────────────────────────────────────────
  guardarMetas: async (req, res) => {
    const { faturamento, reunioes, prospeccoes, metasVendedor } = req.body
    try {
      const mesAno = new Date().toISOString().slice(0, 7) + '-01'

      // Guarda meta global
      await MetaModel.guardar(mesAno, faturamento, reunioes, prospeccoes)

      // Guarda metas individuais dos vendedores
      // metasVendedor é um array: [{ vendedor_id: 1, meta_reunioes: 20 }, ...]
      if (metasVendedor && Array.isArray(metasVendedor)) {
        for (const mv of metasVendedor) {
          if (mv.vendedor_id && mv.meta_reunioes !== undefined) {
            await MetaVendedorModel.guardar(mesAno, mv.vendedor_id, mv.meta_reunioes)
          }
        }
      }

      res.json({ mensagem: 'Metas guardadas.' })
    } catch (err) {
      console.error('Erro ao guardar metas:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // PUT /api/configuracoes/taxas
  // ─────────────────────────────────────────
  guardarTaxas: async (req, res) => {
    try {
      const mesAno = new Date().toISOString().slice(0, 7) + '-01'
      await TaxaConversaoModel.guardar(mesAno, req.body)
      res.json({ mensagem: 'Taxas guardadas.' })
    } catch (err) {
      console.error('Erro ao guardar taxas:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // GET /api/configuracoes/metas
  // Carrega metas actuais para preencher o formulário
  // ─────────────────────────────────────────
  obterConfiguracoes: async (req, res) => {
    try {
      const mesAno = new Date().toISOString().slice(0, 7) + '-01'

      const metaGlobal    = await MetaModel.obterMesAtual()
      const metasVendedor = await MetaVendedorModel.listarPorMes(mesAno)
      const taxas         = await TaxaConversaoModel.obterPorMes(mesAno)

      res.json({ metaGlobal, metasVendedor, taxas })
    } catch (err) {
      console.error('Erro ao obter configurações:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // GET /api/utilizadores
  // ─────────────────────────────────────────
  listarUtilizadores: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, nome, email, perfil, criado_em FROM utilizadores ORDER BY criado_em DESC'
      )
      res.json(rows)
    } catch (err) {
      console.error('Erro ao listar utilizadores:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // DELETE /api/utilizadores/:id
  // ─────────────────────────────────────────
  apagarUtilizador: async (req, res) => {
    try {
      if (req.params.id == req.utilizador.id) {
        return res.status(400).json({ mensagem: 'Não podes remover a tua própria conta.' })
      }
      await db.query('DELETE FROM utilizadores WHERE id = ?', [req.params.id])
      res.json({ mensagem: 'Utilizador removido.' })
    } catch (err) {
      console.error('Erro ao remover utilizador:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  },

  // ─────────────────────────────────────────
  // PUT /api/perfil
  // ─────────────────────────────────────────
  atualizarPerfil: async (req, res) => {
    const bcrypt = require('bcryptjs')
    const { nome, email, senhaAtual, novaSenha } = req.body
    try {
      if (novaSenha) {
        const [[user]] = await db.query(
          'SELECT palavra_passe FROM utilizadores WHERE id = ?', [req.utilizador.id]
        )
        const ok = await bcrypt.compare(senhaAtual, user.palavra_passe)
        if (!ok) return res.status(400).json({ mensagem: 'Senha actual incorrecta.' })
        const hash = await bcrypt.hash(novaSenha, 12)
        await db.query(
          'UPDATE utilizadores SET nome=?, email=?, palavra_passe=? WHERE id=?',
          [nome, email, hash, req.utilizador.id]
        )
      } else {
        await db.query(
          'UPDATE utilizadores SET nome=?, email=? WHERE id=?',
          [nome, email, req.utilizador.id]
        )
      }
      res.json({ mensagem: 'Perfil actualizado.' })
    } catch (err) {
      console.error('Erro ao actualizar perfil:', err)
      res.status(500).json({ mensagem: 'Erro interno.' })
    }
  }
}

module.exports = DashboardController