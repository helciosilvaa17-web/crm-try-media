require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes      = require('./src/routes/auth.routes')
const clientesRoutes  = require('./src/routes/clientes.routes')
const reunioesRoutes  = require('./src/routes/reunioes.routes')
const dashboardRoutes = require('./src/routes/dashboard.routes')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',      authRoutes)
app.use('/api/clientes',  clientesRoutes)
app.use('/api/reunioes',  reunioesRoutes)
app.use('/api',           dashboardRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }))
app.use((err, req, res, next) => res.status(500).json({ mensagem: 'Erro interno do servidor.' }))


const { iniciarLembretes } = require('./src/services/lembrete.service')
// ...
iniciarLembretes() // adiciona mesmo antes do app.listen


app.listen(PORT, () => console.log(`🚀 Servidor a correr em http://localhost:${PORT}`))