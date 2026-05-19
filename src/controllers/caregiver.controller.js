const prisma = require('../config/db')
const { createCaregiverProfileSchema, updateCaregiverProfileSchema } = require('../validations/caregiver.validation')

const createProfile = async (req, res) => {
  try {
    const data = createCaregiverProfileSchema.parse(req.body)

    const existing = await prisma.caregiverProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (existing) {
      return res.status(400).json({ error: 'Ya tienes un perfil de cuidador' })
    }

    const profile = await prisma.caregiverProfile.create({
      data: {
        ...data,
        userId: req.user.id
      }
    })

    res.status(201).json(profile)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: error.errors.map(e => e.message)
      })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const data = updateCaregiverProfileSchema.parse(req.body)

    const profile = await prisma.caregiverProfile.update({
      where: { userId: req.user.id },
      data
    })

    res.json(profile)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: error.errors.map(e => e.message)
      })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getCaregivers = async (req, res) => {
  try {
    const { city, petType, minRating } = req.query

    const where = {
      isApproved: true
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (petType) {
      where.acceptedPetTypes = {
        has: petType.toUpperCase()
      }
    }

    if (minRating) {
      where.ratingAvg = {
        gte: parseFloat(minRating)
      }
    }

    const caregivers = await prisma.caregiverProfile.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        ratingAvg: 'desc'
      }
    })

    res.json(caregivers)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getCaregiverById = async (req, res) => {
  try {
    const { id } = req.params

    const caregiver = await prisma.caregiverProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    })

    if (!caregiver || !caregiver.isApproved) {
      return res.status(404).json({ error: 'Cuidador no encontrado' })
    }

    res.json(caregiver)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  createProfile,
  updateProfile,
  getCaregivers,
  getCaregiverById
}