const db = require('../config/db')

const UtilizadorModel = {
    encontrarPorEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email])
        return rows [0]
    },

     // Adiciona este método dentro do objeto UtilizadorModel,
// a seguir ao método "encontrarPorEmail"

        buscarPorId: async (id) => {
        const [rows] = await db.query(
            'SELECT id, nome, email, perfil FROM utilizadores WHERE id = ?',
            [id]
        )
        return rows[0]
        },   

    criar: async (nome, email, hash, perfil) => {
        await db.query('INSERT INTO utilizadores (nome, email, palavra_passe, perfil) VALUES (?, ?, ?, ?)', [nome, email, hash, perfil])
    },

    listar: async () => {
        const [rows] = await db.query('SELECT id, nome, email, perfil, criado_em FROM utilizadores ORDER BY criado_em DESC')
        return rows
    },

    apagar: async(id) => {
        const [rows] = await db.query('DELETE FROM utilizadores WHERE id = ?', [id])
    },

    atualizar: async (id, nome, email, hash) => {
        if (hash){
            await db.query('UPDATE utilizadores SET nome=?, email=?, palavra_passe=? WHERE id=?', [nome, email, hash, id])
        }
        else{
            await db.query('UPDATE utilizadores SET nome=?, email=? WHERE id=?', [nome, email, id])
        }
    }
}

module.exports = UtilizadorModel