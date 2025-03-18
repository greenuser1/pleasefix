const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const connectDB = require("./config/db")
const CareLog = require("./models/CareLog")
const Plant = require("./models/Plant")

// Initialize express app
const app = express()

// Updated CORS configuration with specific origins
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

// Updated session configuration for production
app.use(
  session({
    secret: "greentrack-super-secret-key-123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Always use secure cookies in production
      sameSite: "none", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents JavaScript from reading the cookie
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

const authRoutes = require("./routes/authRoutes")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/plants", plantRoutes)
app.use("/api/care-logs", careLogRoutes)

// Hardcoded port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

