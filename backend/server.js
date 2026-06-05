const express = require('express')
const cors = require('cors')

const connectDB = require('./config/db')
const seedDatabase = require('./seed/seedDatabase')
const authRoutes = require('./routes/authRoutes')
const customerRoutes = require('./routes/customerRoutes')
const matchRoutes = require('./routes/matchRoutes')

const app = express()
const PORT = process.env.PORT || 5050

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/matches', matchRoutes)

connectDB()
  .then(seedDatabase)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Matchmaker backend running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
