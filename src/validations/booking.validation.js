const { z } = require('zod')

const createBookingSchema = z.object({
  caregiverId: z.string().uuid('ID de cuidador invalido'),
  petId: z.string().uuid('ID de mascota invalido'),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
}).refine(data => data.endDate > data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate']
})

module.exports = {
  createBookingSchema
}