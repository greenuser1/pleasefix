const { verifyToken } = require("../utils/token")

module.exports = (req, res, next) => {
  if (req.session.user) {
    return next()
  }

  // If no session, check for token in cookies or Authorization header
  const token =
    req.cookies["greentrack.token"] || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""))

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Verify token
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Set user in session for future requests
  req.session.user = {
    id: decoded.id,
    username: decoded.username,
  }

  req.session.save()
  next()
}

