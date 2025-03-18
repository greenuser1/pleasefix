const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const path = require("path")
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser")

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
app.use(cookieParser())

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
    resave: true, // Changed to true to ensure session is saved
    saveUninitialized: true, // Changed to true to ensure session is created
    store: mongoStore,
    cookie: {
      secure: false, // Set to false for now, even in production
      sameSite: "none", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents JavaScript from reading the cookie
      path: "/", // Ensure cookie is available for all paths
      domain: ".onrender.com", // Set domain to .onrender.com to allow cross-subdomain cookies
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
  res.header("Access-Control-Allow-Origin", req.headers.origin || "https://pleasefix-1.onrender.com")
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization",
  )

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

// API route
app.get("/api", (req, res) => {
  res.json({
    message: "API is running",
    sessionId: req.session.id,
    user: req.session.user || null,
  })
})

// Load routes
const authRoutes = require("./routes/authRoutes")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/plants", require("./middleware/authMiddleware"), plantRoutes)
app.use("/api/care-logs", require("./middleware/authMiddleware"), careLogRoutes)

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

