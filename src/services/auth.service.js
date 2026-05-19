const prisma = require('../config/db')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt')

const register = async ({ fullName, email, password, phone, role }) => {
  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('Ya existe una cuenta con ese email')
  }

  // Encriptar la contraseña
  const passwordHash = await hashPassword(password)

  // Crear el usuario
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      phone,
      role
    }
  })

  // Generar tokens
  const payload = { id: user.id, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Guardar refresh token en BD
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt
    }
  })

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  }
}

const login = async ({ email, password }) => {
  // Buscar el usuario
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.isActive) {
    throw new Error('Credenciales incorrectas')
  }

  // Verificar contraseña
  const isValid = await comparePassword(password, user.passwordHash)

  if (!isValid) {
    throw new Error('Credenciales incorrectas')
  }

  // Generar tokens
  const payload = { id: user.id, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Guardar refresh token en BD
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt
    }
  })

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  }
}

module.exports = {
  register,
  login
}