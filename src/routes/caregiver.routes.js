const express = require('express')
const { createProfile, updateProfile, getCaregivers, getCaregiverById } = require('../controllers/caregiver.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', getCaregivers)
router.get('/:id', getCaregiverById)
router.post('/profile', authenticate, authorize('CAREGIVER'), createProfile)
router.put('/profile', authenticate, authorize('CAREGIVER'), updateProfile)

module.exports = router