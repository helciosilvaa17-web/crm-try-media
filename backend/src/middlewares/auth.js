const jwt = require('jsonwebtoken')

// Verifica se o token JWT é válido
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido. Acesso negado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.utilizador = decoded // { id, nome, email, perfil }
    next()
  } catch {
    return res.status(403).json({ mensagem: 'Token inválido ou expirado.' })
  }
}

// Verifica se o utilizador é administrador
function apenasAdmin(req, res, next) {
  if (req.utilizador?.perfil !== 'administrador') {
    return res.status(403).json({ mensagem: 'Acesso restrito a administradores.' })
  }
  next()
}

module.exports = { autenticar, apenasAdmin }
