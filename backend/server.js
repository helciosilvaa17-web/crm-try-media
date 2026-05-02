require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const authRoutes    = require('./routes/auth')
const clientesRoutes = require('./routes/clientes')
const reunioesRoutes = require('./routes/reunioes')
const apiRoutes     = require('./routes/api')

const app  = express()
const PORT = process.env.PORT || 3001

// ─────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // URL do Vite em dev
  credentials: true
}))

app.use(express.json())

// ─────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/reunioes', reunioesRoutes)
app.use('/api',          apiRoutes)

// Rota de saúde — útil para testar se o servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' })
})

// Erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err)
  res.status(500).json({ mensagem: 'Erro interno do servidor.' })
})

// ─────────────────────────────────────────
// Arranque
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

