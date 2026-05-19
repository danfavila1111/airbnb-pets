const express = require('express')
const { createReviewController, getCaregiverReviewsController } = require('../controllers/review.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/', authenticate, createReviewController)
router.get('/caregiver/:caregiverId', getCaregiverReviewsController)

module.exports = router