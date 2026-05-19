const express = require('express')
const { getMessages } = require('../controllers/message.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/:bookingId', authenticate, getMessages)

module.exports = router