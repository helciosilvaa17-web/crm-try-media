const express = require('express')
const router  = express.Router()
const DealsController = require('../controllers/deals.controller')
const { autenticar } = require('../middlewares/auth')

router.use(autenticar)
router.get('/',       DealsController.listar)
router.post('/',      DealsController.criar)
router.delete('/:id', DealsController.apagar)

module.exports = router