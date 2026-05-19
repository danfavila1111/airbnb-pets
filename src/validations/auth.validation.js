const { z } = require('zod')

const registerSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'CAREGIVER']).default('OWNER')
})

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'La contrasena es requerida')
})

module.exports = {
  registerSchema,
  loginSchema
}