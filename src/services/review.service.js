const prisma = require('../config/db')

const createReview = async ({ bookingId, reviewerId, rating, comment }) => {
  // Verificar que la reserva existe y está completada
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })

  if (!booking) {
    throw new Error('Reserva no encontrada')
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('Solo puedes reseñar reservas completadas')
  }

  // Verificar que el reviewer es parte de la reserva
  if (booking.ownerId !== reviewerId && booking.caregiverId !== reviewerId) {
    throw new Error('No tienes permiso para reseñar esta reserva')
  }

  // Determinar a quien se le hace la reseña
  const reviewedId = booking.ownerId === reviewerId
    ? booking.caregiverId
    : booking.ownerId

  // Verificar que no haya reseñado antes
  const existing = await prisma.review.findFirst({
    where: { bookingId, reviewerId }
  })

  if (existing) {
    throw new Error('Ya reseñaste esta reserva')
  }

  // Crear la reseña
  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId,
      reviewedId,
      rating,
      comment
    }
  })

  // Actualizar el rating promedio del cuidador
  if (reviewedId === booking.caregiverId) {
    const reviews = await prisma.review.findMany({
      where: { reviewedId }
    })

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.caregiverProfile.update({
      where: { userId: reviewedId },
      data: { ratingAvg: avg }
    })
  }

  return review
}

const getCaregiverReviews = async (caregiverId) => {
  return prisma.review.findMany({
    where: { reviewedId: caregiverId },
    include: {
      reviewer: {
        select: { fullName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

module.exports = {
  createReview,
  getCaregiverReviews
}