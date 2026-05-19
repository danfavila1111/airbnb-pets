const { z } = require('zod')

const createCaregiverProfileSchema = z.object({
  bio: z.string().min(20, 'La bio debe tener al menos 20 caracteres'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().optional(),
  maxPets: z.number().int().min(1).max(10).default(1),
  acceptedPetTypes: z.array(
    z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'])
  ).min(1, 'Debes aceptar al menos un tipo de mascota')
})

const updateCaregiverProfileSchema = createCaregiverProfileSchema.partial()

module.exports = {
  createCaregiverProfileSchema,
  updateCaregiverProfileSchema
}