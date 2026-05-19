const { verifyAccessToken } = require('../utils/jwt')

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado' })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esto' })
    }
    next()
  }
}

module.exports = {
  authenticate,
  authorize
}