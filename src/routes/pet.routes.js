const express = require('express')
const { createPet, getMyPets, updatePet, deletePet } = require('../controllers/pet.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/', authenticate, authorize('OWNER'), createPet)
router.get('/', authenticate, authorize('OWNER'), getMyPets)
router.put('/:id', authenticate, authorize('OWNER'), updatePet)
router.delete('/:id', authenticate, authorize('OWNER'), deletePet)

module.exports = router