const express = require('express')
const router  = express.Router()
const AuthController = require('../controllers/auth.controller')
const { autenticar, apenasAdmin } = require('../middlewares/auth')

router.post('/login',       AuthController.login)
router.post('/criar-conta', autenticar, apenasAdmin, AuthController.criarConta)
router.get('/me',           autenticar, AuthController.me)

module.exports = router