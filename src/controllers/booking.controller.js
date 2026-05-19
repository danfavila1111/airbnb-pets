const { createBooking, getMyBookings, confirmBooking, cancelBooking } = require('../services/booking.service')
const { createBookingSchema } = require('../validations/booking.validation')

const createBookingController = async (req, res) => {
  try {
    const data = createBookingSchema.parse(req.body)
    const booking = await createBooking({
      ownerId: req.user.id,
      ...data
    })
    res.status(201).json(booking)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: error.errors.map(e => e.message)
      })
    }
    res.status(400).json({ error: error.message })
  }
}

const getMyBookingsController = async (req, res) => {
  try {
    const bookings = await getMyBookings(req.user.id, req.user.role)
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const confirmBookingController = async (req, res) => {
  try {
    const booking = await confirmBooking(req.params.id, req.user.id)
    res.json(booking)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const cancelBookingController = async (req, res) => {
  try {
    const { reason } = req.body
    const booking = await cancelBooking(req.params.id, req.user.id, reason)
    res.json(booking)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  createBookingController,
  getMyBookingsController,
  confirmBookingController,
  cancelBookingController
}