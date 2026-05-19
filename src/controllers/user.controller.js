const prisma = require('../config/db')

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        caregiverProfile: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateMe = async (req, res) => {
  try {
    const { fullName, phone } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, phone },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  getMe,
  updateMe
}