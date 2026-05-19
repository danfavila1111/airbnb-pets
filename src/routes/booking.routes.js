const express = require('express')
const {
  createBookingController,
  getMyBookingsController,
  confirmBookingController,
  cancelBookingController
} = require('../controllers/booking.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/', authenticate, authorize('OWNER'), createBookingController)
router.get('/', authenticate, getMyBookingsController)
router.patch('/:id/confirm', authenticate, authorize('CAREGIVER'), confirmBookingController)
router.patch('/:id/cancel', authenticate, cancelBookingController)

module.exports = router