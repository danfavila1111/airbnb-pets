const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { verifyAccessToken } = require('./utils/jwt')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const petRoutes = require('./routes/pet.routes')
const caregiverRoutes = require('./routes/caregiver.routes')
const bookingRoutes = require('./routes/booking.routes')
const reviewRoutes = require('./routes/review.routes')
const messageRoutes = require('./routes/message.routes')
const chatbotRoutes = require('./routes/chatbot.routes')
const statsRoutes = require('./routes/stats.routes')

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
})

const PORT = process.env.PORT || 3000

// Seguridad
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta en 15 minutos' }
})
app.use(limiter)

app.use(express.json())

// Rutas
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'AirBnb Pets Colombia' })
})
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/caregivers', caregiverRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.use('/api/stats', statsRoutes)


// Socket.io - autenticacion
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Token requerido'))
    const payload = verifyAccessToken(token)
    socket.user = payload
    next()
  } catch {
    next(new Error('Token invalido'))
  }
})

// Socket.io - eventos
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.user.id}`)

  // Unirse a la sala de una reserva
  socket.on('join_booking', (bookingId) => {
    socket.join(bookingId)
    console.log(`Usuario ${socket.user.id} se unio a reserva ${bookingId}`)
  })

  // Enviar mensaje
  socket.on('send_message', async (data) => {
    const { bookingId, content } = data

    try {
      const prisma = require('./config/db')

      // Verificar que el usuario es parte de la reserva
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      })

      if (!booking) return socket.emit('error', { message: 'Reserva no encontrada' })

      if (booking.ownerId !== socket.user.id && booking.caregiverId !== socket.user.id) {
        return socket.emit('error', { message: 'No tienes permiso para chatear en esta reserva' })
      }

      // Guardar mensaje en BD
      const message = await prisma.message.create({
        data: {
          bookingId,
          senderId: socket.user.id,
          content
        },
        include: {
          sender: {
            select: { fullName: true }
          }
        }
      })

      // Emitir el mensaje a todos en la sala
      io.to(bookingId).emit('new_message', message)
    } catch (error) {
      socket.emit('error', { message: 'Error al enviar mensaje' })
    }
  })

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.user.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})