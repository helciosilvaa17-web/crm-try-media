const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'crm_try_media',
  waitForConnections: true,
  connectionLimit: 10,
})

// Testa a ligação ao arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ Base de dados conectada com sucesso!')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Erro ao conectar à base de dados:', err.message)
  })

module.exports = pool
