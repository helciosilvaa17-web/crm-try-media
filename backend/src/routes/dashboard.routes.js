// backend/src/routes/dashboard.routes.js

const express    = require('express')
const router     = express.Router()
const DashboardController = require('../controllers/dashboard.controller')
const { autenticar, apenasAdmin } = require('../middlewares/auth')

router.use(autenticar)

router.get ('/dashboard',                    DashboardController.obterDashboard)
router.get ('/relatorios',      apenasAdmin, DashboardController.obterRelatorios)
router.get ('/relatorios/vendedor/:id', apenasAdmin, DashboardController.obterRelatorioVendedor)
router.get ('/configuracoes/metas', apenasAdmin, DashboardController.obterConfiguracoes)
router.put ('/configuracoes/metas', apenasAdmin, DashboardController.guardarMetas)
router.put ('/configuracoes/taxas', apenasAdmin, DashboardController.guardarTaxas)
router.get ('/utilizadores',    apenasAdmin, DashboardController.listarUtilizadores)
router.delete('/utilizadores/:id', apenasAdmin, DashboardController.apagarUtilizador)
router.put ('/perfil',               DashboardController.atualizarPerfil)

module.exports = router