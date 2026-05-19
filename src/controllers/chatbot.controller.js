const { getChatbotResponse } = require('../services/chatbot.service')

const chatbotController = async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    const response = await getChatbotResponse(message, context || {})

    res.json({
      message: response,
      from: 'AirBnb Pets Bot'
    })
  } catch (error) {
    console.error('Error chatbot:', error.message)
    res.status(500).json({ error: 'Error al procesar tu mensaje', detail: error.message })
  }
}

module.exports = { chatbotController }