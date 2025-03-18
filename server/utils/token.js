const crypto = require("crypto")

const SECRET_KEY = "greentrack-super-secret-key-123"

// Generate a simple token
const generateToken = (user) => {
  const data = {
    id: user.id,
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  // Convert to string and encode
  const payload = Buffer.from(JSON.stringify(data)).toString("base64")

  // Create signature
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("base64")

  // Return token as payload.signature
  return `${payload}.${signature}`
}

// Verify token
const verifyToken = (token) => {
  try {
    // Split token into parts
    const [payload, signature] = token.split(".")

    // Verify signature
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("base64")

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const data = JSON.parse(Buffer.from(payload, "base64").toString())

    // Check expiration
    if (data.exp < Date.now()) {
      return null
    }

    return data
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

module.exports = {
  generateToken,
  verifyToken,
}

