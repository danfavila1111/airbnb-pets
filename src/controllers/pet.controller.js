const prisma = require('../config/db')
const { createPetSchema, updatePetSchema } = require('../validations/pet.validation')

const createPet = async (req, res) => {
  try {
    const data = createPetSchema.parse(req.body)

    const pet = await prisma.pet.create({
      data: {
        ...data,
        ownerId: req.user.id
      }
    })

    res.status(201).json(pet)
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

const getMyPets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        ownerId: req.user.id,
        isActive: true
      }
    })

    res.json(pets)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updatePet = async (req, res) => {
  try {
    const { id } = req.params
    const data = updatePetSchema.parse(req.body)

    const pet = await prisma.pet.findUnique({
      where: { id }
    })

    if (!pet || pet.ownerId !== req.user.id) {
      return res.status(404).json({ error: 'Mascota no encontrada' })
    }

    const updated = await prisma.pet.update({
      where: { id },
      data
    })

    res.json(updated)
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

const deletePet = async (req, res) => {
  try {
    const { id } = req.params

    const pet = await prisma.pet.findUnique({
      where: { id }
    })

    if (!pet || pet.ownerId !== req.user.id) {
      return res.status(404).json({ error: 'Mascota no encontrada' })
    }

    await prisma.pet.update({
      where: { id },
      data: { isActive: false }
    })

    res.json({ message: 'Mascota eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  createPet,
  getMyPets,
  updatePet,
  deletePet
}