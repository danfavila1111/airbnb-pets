const { register, login } = require('../services/auth.service')
const { registerSchema, loginSchema } = require('../validations/auth.validation')

const registerController = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const result = await register(data)
    res.status(201).json(result)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: error.errors.map(e => e.message)
      })
    }
    res.status(400).json({ error: error.message })
  }
}

const loginController = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    const result = await login(data)
    res.status(200).json(result)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: error.errors.map(e => e.message)
      })
    }
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  registerController,
  loginController
}