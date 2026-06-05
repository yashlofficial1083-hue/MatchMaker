const User = require('../models/User')

async function login(req, res) {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' })
  }

  const user = await User.findOne({ username }).lean()
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  return res.json({
    id: user._id,
    name: user.name,
    token: `mock-token-${user._id}`,
  })
}

module.exports = { login }
