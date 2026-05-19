const prisma = require('../config/db')

const PLATFORM_FEE_PERCENT = 0.15

const createBooking = async ({ ownerId, caregiverId, petId, startDate, endDate }) => {
  // Verificar que el cuidador existe y está aprobado
  const caregiver = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiverId }
  })

  if (!caregiver || !caregiver.isApproved) {
    throw new Error('Cuidador no disponible')
  }

  // Verificar que la mascota pertenece al owner
  const pet = await prisma.pet.findUnique({
    where: { id: petId }
  })

  if (!pet || pet.ownerId !== ownerId || !pet.isActive) {
    throw new Error('Mascota no encontrada')
  }

  // Verificar que el cuidador acepta ese tipo de mascota
  if (!caregiver.acceptedPetTypes.includes(pet.species)) {
    throw new Error(`El cuidador no acepta mascotas de tipo ${pet.species}`)
  }

  // Verificar disponibilidad: no debe tener reservas activas en esas fechas
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      caregiverId,
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        }
      ]
    }
  })

  if (conflictingBooking) {
    throw new Error('El cuidador no está disponible en esas fechas')
  }

  // Calcular precio
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const pricePerNight = 50000 // COP por noche (esto luego vendrá de price_rules)
  const totalPrice = days * pricePerNight
  const platformFee = totalPrice * PLATFORM_FEE_PERCENT

  // Crear la reserva
  const booking = await prisma.booking.create({
    data: {
      ownerId,
      caregiverId,
      petId,
      startDate,
      endDate,
      totalPrice,
      platformFee
    },
    include: {
      pet: true,
      caregiver: {
        select: {
          fullName: true,
          email: true
        }
      }
    }
  })

  return booking
}

const getMyBookings = async (userId, role) => {
  const where = role === 'OWNER'
    ? { ownerId: userId }
    : { caregiverId: userId }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      pet: true,
      owner: {
        select: { fullName: true, email: true }
      },
      caregiver: {
        select: { fullName: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return bookings
}

const confirmBooking = async (bookingId, caregiverId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })

  if (!booking) {
    throw new Error('Reserva no encontrada')
  }

  if (booking.caregiverId !== caregiverId) {
    throw new Error('No tienes permiso para confirmar esta reserva')
  }

  if (booking.status !== 'PENDING') {
    throw new Error('Solo se pueden confirmar reservas pendientes')
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' }
  })
}

const cancelBooking = async (bookingId, userId, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })

  if (!booking) {
    throw new Error('Reserva no encontrada')
  }

  if (booking.ownerId !== userId && booking.caregiverId !== userId) {
    throw new Error('No tienes permiso para cancelar esta reserva')
  }

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new Error('Esta reserva no se puede cancelar')
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason
    }
  })
}

module.exports = {
  createBooking,
  getMyBookings,
  confirmBooking,
  cancelBooking
}