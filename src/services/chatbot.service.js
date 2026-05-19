const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const SYSTEM_PROMPT = `Eres el asistente virtual de AirBnb Pets Colombia, una plataforma donde los dueños de mascotas pueden encontrar cuidadores de confianza en hogares particulares.

Tu rol es:
- Ayudar a los usuarios con preguntas sobre la plataforma (reservas, pagos, cancelaciones, registro)
- Dar consejos sobre el cuidado de mascotas (perros, gatos, aves, conejos)
- Orientar en emergencias veterinarias básicas
- Ser amable, profesional y responder siempre en español
- Si no sabes algo, recomendar contactar al soporte humano

No puedes:
- Procesar pagos ni hacer reservas directamente
- Acceder a información personal de usuarios
- Dar diagnósticos médicos veterinarios definitivos

Responde de forma concisa, máximo 3 párrafos.`

const getChatbotResponse = async (userMessage, context = {}) => {
  const { petSpecies, bookingStatus } = context

  let contextMessage = ''
  if (petSpecies) contextMessage += `El usuario tiene una mascota de tipo: ${petSpecies}. `
  if (bookingStatus) contextMessage += `Estado actual de su reserva: ${bookingStatus}. `

const messages = [
  {
    role: 'system',
    content: SYSTEM_PROMPT
  },
  {
    role: 'user',
    content: contextMessage ? `${contextMessage}\n\nPregunta: ${userMessage}` : userMessage
  }
]

const response = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  messages,
  max_tokens: 500,
  temperature: 0.7
})

  return response.choices[0].message.content
}

module.exports = { getChatbotResponse }