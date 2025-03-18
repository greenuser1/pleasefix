module.exports = (req, res, next) => {
  console.log("Auth middleware check - Session ID:", req.session.id)
  console.log("Auth middleware check - User in session:", req.session.user || "none")
  console.log("Auth middleware check - Cookies:", req.headers.cookie || "No cookies")

  if (!req.session.user) {
    console.log("Auth middleware: User not authenticated")
    return res.status(401).json({ message: "Unauthorized" })
  }
  console.log("Auth middleware: User authenticated")
  next()
}

