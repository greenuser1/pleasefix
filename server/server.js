const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const connectDB = require("./config/db")
const CareLog = require("./models/CareLog")
const Plant = require("./models/Plant")

// Initialize express app
const app = express()

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
      secure: true, // Use secure cookies in production
      sameSite: "none", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents JavaScript from reading the cookie
      domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined, // Allow cookies across subdomains
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

  // Set CORS headers for all responses
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Origin", req.headers.origin)
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept")

  next()
})

// Add a route handler for the root path with HTML response
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GreenTrack API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #009245;
          border-bottom: 2px solid #e6f7ee;
          padding-bottom: 10px;
        }
        h2 {
          color: #007a3a;
        }
        code {
          background-color: #f5f5f5;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: monospace;
        }
        .endpoint {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #e6f7ee;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>GreenTrack API</h1>
      <p>The API server is running successfully. Use the following endpoints to interact with the API:</p>
      
      <h2>Authentication Endpoints</h2>
      <div class="endpoint">
        <code>POST /api/auth/register</code> - Register a new user
      </div>
      <div class="endpoint">
        <code>POST /api/auth/login</code> - Login a user
      </div>
      <div class="endpoint">
        <code>POST /api/auth/logout</code> - Logout a user
      </div>
      <div class="endpoint">
        <code>GET /api/auth/me</code> - Get current user info
      </div>
      
      <h2>Plant Endpoints</h2>
      <div class="endpoint">
        <code>GET /api/plants</code> - Get all plants
      </div>
      <div class="endpoint">
        <code>POST /api/plants</code> - Create a new plant
      </div>
      <div class="endpoint">
        <code>GET /api/plants/:id</code> - Get a specific plant
      </div>
      <div class="endpoint">
        <code>PUT /api/plants/:id</code> - Update a plant
      </div>
      <div class="endpoint">
        <code>DELETE /api/plants/:id</code> - Delete a plant
      </div>
      
      <h2>Care Log Endpoints</h2>
      <div class="endpoint">
        <code>GET /api/care-logs</code> - Get all care logs
      </div>
      <div class="endpoint">
        <code>POST /api/care-logs</code> - Create a new care log
      </div>
      <div class="endpoint">
        <code>GET /api/plants/:id/care-logs</code> - Get care logs for a specific plant
      </div>
      <div class="endpoint">
        <code>PUT /api/care-logs/:id</code> - Update a care log
      </div>
      <div class="endpoint">
        <code>DELETE /api/care-logs/:id</code> - Delete a care log
      </div>
    </body>
    </html>
  `)
})

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" })
})

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware check:", req.session.user ? "Authenticated" : "Not authenticated")
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  next()
}

app.get("/api/plants/:id/care-logs", authMiddleware, async (req, res) => {
  try {
    const plantId = req.params.id
    const userId = req.session.user.id

    console.log(`[DIRECT HANDLER] Getting care logs for plant: ${plantId} and user: ${userId}`)

    const plant = await Plant.findOne({
      _id: plantId,
      user: userId,
    })

    if (!plant) {
      console.log(`Plant ${plantId} not found for user ${userId}`)
      return res.status(404).json({ error: "Plant not found" })
    }

    const careLogs = await CareLog.find({
      plant: plantId,
      user: userId,
    }).sort({ createdAt: -1 })

    console.log(`Found ${careLogs.length} care logs for plant ${plantId}`)
    res.json(careLogs)
  } catch (err) {
    console.error(`Error in direct GET /api/plants/:id/care-logs:`, err)
    res.status(500).json({ error: err.message })
  }
})

// Update the authController.js login function
const authController = require("./controllers/authController")

// Override the loginUser function to properly set the session
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await require("./models/User").findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await require("bcrypt").compare(password, user.passwordHash)
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

// Override the registerUser function to properly set the session
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await require("./models/User").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with that email or username",
      })
    }

    // Hash password
    const salt = await require("bcrypt").genSalt(10)
    const passwordHash = await require("bcrypt").hash(password, salt)

    // Create new user
    const User = require("./models/User")
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

// Add a route to check if the session is working
app.get("/api/session-test", (req, res) => {
  res.json({
    sessionId: req.session.id,
    user: req.session.user || null,
    cookies: req.headers.cookie || "No cookies",
  })
})

const authRoutes = require("./routes/authRoutes")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/plants", plantRoutes)
app.use("/api/care-logs", careLogRoutes)

// Hardcoded port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

