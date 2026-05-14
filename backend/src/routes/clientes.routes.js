const express = require('express')
const router  = express.Router()
const ClientesController = require('../controllers/clientes.controller')
const { autenticar, apenasAdmin } = require('../middlewares/auth')

router.use(autenticar)

router.get('/',                             ClientesController.listar)
router.get('/:id',                          ClientesController.obter)
router.post('/',                            ClientesController.criar)
router.put('/:id',                          ClientesController.atualizar)
router.delete('/:id', apenasAdmin,          ClientesController.apagar)
router.post('/:id/interacoes',              ClientesController.criarInteracao)
router.put('/:clienteId/interacoes/:id',    ClientesController.editarInteracao)
router.delete('/:clienteId/interacoes/:id', ClientesController.apagarInteracao)

module.exports = router