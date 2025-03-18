const jwt = require("jsonwebtoken")

const JWT_SECRET = "greentrack-jwt-secret-key-123"

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" })
}

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

module.exports = {
  generateToken,
  verifyToken,
}

