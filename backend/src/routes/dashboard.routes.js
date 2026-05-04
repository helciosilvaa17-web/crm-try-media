const express = require('express')
const router  = express.Router()
const DashboardController = require('../controllers/dashboard.controller')
const { autenticar, apenasAdmin } = require('../middlewares/auth')

// Todos os endpoints requerem autenticação
router.use(autenticar)

router.get('/dashboard',              DashboardController.obterDashboard)
router.get('/relatorios',  apenasAdmin, DashboardController.obterRelatorios)
router.put('/configuracoes/metas', apenasAdmin, DashboardController.guardarMetas)
router.get('/utilizadores', apenasAdmin, DashboardController.listarUtilizadores)
router.delete('/utilizadores/:id', apenasAdmin, DashboardController.apagarUtilizador)
router.put('/perfil',              DashboardController.atualizarPerfil)

module.exports = router