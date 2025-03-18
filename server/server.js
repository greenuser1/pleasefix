const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const path = require("path")
const connectDB = require("./config/db")

// Initialize express app
const app = express()

// Get environment
const isProduction = process.env.NODE_ENV === "production"
console.log(`Running in ${isProduction ? "production" : "development"} mode`)

// CORS configuration - CRITICAL for cross-domain cookies
app.use(
  cors({
    origin: ["https://pleasefix-1.onrender.com", "http://localhost:8080"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
connectDB()

// Session store
const mongoStore = MongoStore.create({
  mongoUrl: "mongodb+srv://greendb:test11@greentrack.9xjck.mongodb.net/greentrack?retryWrites=true&w=majority",
  collectionName: "sessions",
  ttl: 24 * 60 * 60, // 1 day
  autoRemove: "native",
})

// Session configuration
app.use(
  session({
    name: "greentrack.sid", // Custom session name
    secret: "greentrack-super-secret-key-123",
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
      secure: isProduction, // Only use secure in production
      sameSite: isProduction ? "none" : "lax", // Required for cross-site cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents JavaScript from reading the cookie
      path: "/", // Ensure cookie is available for all paths
    },
  }),
)

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.log(`Session ID: ${req.session.id}`)
  console.log(`User in session: ${req.session.user ? JSON.stringify(req.session.user) : "none"}`)
  console.log(`Cookies: ${req.headers.cookie || "none"}`)

  // Set CORS headers for all responses
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Origin", req.headers.origin)
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept")

  next()
})

// Root route
app.get("/", (req, res) => {
  res.send(`
    <h1>GreenTrack API</h1>
    <p>Server is running. Session ID: ${req.session.id}</p>
    <p>User: ${req.session.user ? JSON.stringify(req.session.user) : "Not logged in"}</p>
  `)
})

// Session test route
app.get("/api/session-test", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1
  } else {
    req.session.views++
  }

  res.json({
    sessionId: req.session.id,
    views: req.session.views,
    user: req.session.user || null,
  })
})

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body
    const User = require("./models/User")
    const bcrypt = require("bcrypt")

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with that email or username",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash,
    })

    await user.save()

    // Set session
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err)
        return res.status(500).json({ message: "Session error" })
      }

      console.log("Session saved successfully:", req.session.id)
      console.log("User in session after save:", req.session.user)
      console.log("Cookies being sent:", res.getHeader("Set-Cookie"))

      res.status(201).json({
        message: "User registered successfully",
        user: req.session.user,
      })
    })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: err.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const User = require("./models/User")
    const bcrypt = require("bcrypt")

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Set session user
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err)
        return res.status(500).json({ message: "Session error" })
      }

      console.log("Session saved successfully:", req.session.id)
      console.log("User in session after save:", req.session.user)
      console.log("Cookies being sent:", res.getHeader("Set-Cookie"))

      res.json({
        message: "Logged in successfully",
        user: req.session.user,
      })
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/api/auth/me", (req, res) => {
  console.log("GET /api/auth/me - Session:", req.session.id)
  console.log("User in session:", req.session.user || "none")

  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  res.json({
    user: req.session.user,
    sessionId: req.session.id,
  })
})

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("greentrack.sid")
    res.json({ message: "Logged out successfully" })
  })
})

// Load routes
const authMiddleware = require("./middleware/authMiddleware")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

app.use("/api/plants", authMiddleware, plantRoutes)
app.use("/api/care-logs", authMiddleware, careLogRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Server error", error: err.message })
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

