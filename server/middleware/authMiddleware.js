const { verifyToken } = require("../utils/token")

module.exports = (req, res, next) => {
  console.log("Auth middleware check - Session ID:", req.session.id)
  console.log("Auth middleware check - User in session:", req.session.user || "none")
  console.log("Auth middleware check - Cookies:", req.headers.cookie || "No cookies")

  if (req.session.user) {
    console.log("Auth middleware: User authenticated via session")
    return next()
  }

  // If no session, check for token in cookies or Authorization header
  const token =
    req.cookies["greentrack.token"] || (req.headers.authorization && req.headers.authorization.split(" ")[1])

  if (!token) {
    console.log("Auth middleware: No token found")
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Verify token
  const decoded = verifyToken(token)

  if (!decoded) {
    console.log("Auth middleware: Invalid token")
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Set user in session for future requests
  req.session.user = {
    id: decoded.id,
    username: decoded.username,
  }

  req.session.save()

  console.log("Auth middleware: User authenticated via token")
  next()
}

