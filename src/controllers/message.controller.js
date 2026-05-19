const prisma = require('../config/db')

const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params

    // Verificar que el usuario es parte de la reserva
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    if (booking.ownerId !== req.user.id && booking.caregiverId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver estos mensajes' })
    }

    const messages = await prisma.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: { fullName: true }
        }
      },
      orderBy: { sentAt: 'asc' }
    })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getMessages }