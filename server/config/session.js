const session = require("express-session")
const MongoStore = require("connect-mongo")

// Get environment
const isProduction = process.env.NODE_ENV === "production"

// Create MongoDB session store
const mongoStore = MongoStore.create({
  mongoUrl: "mongodb+srv://greendb:test11@greentrack.9xjck.mongodb.net/greentrack?retryWrites=true&w=majority",
  collectionName: "sessions",
  ttl: 24 * 60 * 60, // 1 day
  autoRemove: "native",
})

// Configure session middleware
const sessionMiddleware = session({
  name: "greentrack.sid", // Custom session name
  secret: "greentrack-super-secret-key-123",
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    secure: false, // Set to false for now to debug
    sameSite: "lax", // Use lax for now
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevents JavaScript from reading the cookie
    path: "/", // Ensure cookie is available for all paths
  },
})

// Export session middleware
module.exports = sessionMiddleware

