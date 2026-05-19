const express = require('express')
const { chatbotController } = require('../controllers/chatbot.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/', authenticate, chatbotController)

module.exports = router