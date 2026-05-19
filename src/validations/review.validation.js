const { z } = require('zod')

const createReviewSchema = z.object({
  bookingId: z.string().uuid('ID de reserva invalido'),
  rating: z.number().int().min(1).max(5, 'El rating debe ser entre 1 y 5'),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').optional()
})

module.exports = {
  createReviewSchema
}