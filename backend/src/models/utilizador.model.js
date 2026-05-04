const db = require('../config/db')

const UtilizadorModel = {
    encontrarPorEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email])
        return rows [0]
    },

    criar: async (nome, email, hash, perfil) => {
        await db.query('INSERT INTO utilizadores (nome, email, palavra_passe, perfil) VALUES (?, ?, ?, ?)', [nome, email, hash, perfil])
    },

    
}