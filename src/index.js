const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const petRoutes = require('./routes/pet.routes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Seguridad
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta en 15 minutos' }
})
app.use(limiter)

// Parsear JSON
app.use(express.json())

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'AirBnb Pets Colombia' })
})

app.use('/api/auth', authRoutes)

app.use('/api/users', userRoutes)

app.use('/api/pets', petRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})