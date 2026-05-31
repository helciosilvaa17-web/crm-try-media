// backend/src/routes/reunioes.routes.js

const express    = require('express')
const router     = express.Router()
const ReunioesController = require('../controllers/reunioes.controller')
const { autenticar } = require('../middlewares/auth')

router.use(autenticar)

router.get('/',                 ReunioesController.listar)
router.get('/utilizadores',     ReunioesController.listarUtilizadores)
router.get('/:id',              ReunioesController.buscarPorId)

router.post('/',                ReunioesController.criar)
router.put('/:id',              ReunioesController.atualizar)
router.delete('/:id',           ReunioesController.apagar)


module.exports = router