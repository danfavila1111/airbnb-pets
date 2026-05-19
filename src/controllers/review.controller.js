const { createReview, getCaregiverReviews } = require('../services/review.service')
const { createReviewSchema } = require('../validations/review.validation')

const createReviewController = async (req, res) => {
  try {
    const data = createReviewSchema.parse(req.body)
    const review = await createReview({
      ...data,
      reviewerId: req.user.id
    })
    res.status(201).json(review)
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

const getCaregiverReviewsController = async (req, res) => {
  try {
    const reviews = await getCaregiverReviews(req.params.caregiverId)
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  createReviewController,
  getCaregiverReviewsController
}