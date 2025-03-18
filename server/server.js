const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

// Initialize express app
const app = express()

// Get environment
const isProduction = process.env.NODE_ENV === "production"
console.log(`Running in ${isProduction ? "production" : "development"} mode`)

// Updated CORS configuration with specific origins and credentials
app.use(
  cors({
    origin: [
      "https://pleasefix-1.onrender.com", // Frontend domain
      "http://localhost:8080", // Keep localhost for development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json())

// Database connection
connectDB()

// Fix session configuration for cross-domain cookies
app.use(
  session({
    secret: "greentrack-super-secret-key-123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Only use secure in production
      sameSite: isProduction ? "none" : "lax", // Required for cross-site cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents JavaScript from reading the cookie
      // Remove domain restriction to allow cookies to work properly
    },
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://greendb:test11@greentrack.9xjck.mongodb.net/greentrack?retryWrites=true&w=majority",
      collectionName: "sessions",
    }),
  }),
)

// Debug middleware to log requests and session info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.log(`Session ID: ${req.session.id}`)
  console.log(`User in session: ${req.session.user ? JSON.stringify(req.session.user) : "none"}`)
  console.log(`Cookies: ${req.headers.cookie || "none"}`)

  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/plants", plantRoutes)
app.use("/api/care-logs", careLogRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("GreenTrack API is running")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

