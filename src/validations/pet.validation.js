const { z } = require('zod')

const createPetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER']),
  breed: z.string().optional(),
  ageYears: z.number().int().min(0).optional(),
  weightKg: z.number().min(0).optional(),
  specialNeeds: z.string().optional()
})

const updatePetSchema = createPetSchema.partial()

module.exports = {
  createPetSchema,
  updatePetSchema
}