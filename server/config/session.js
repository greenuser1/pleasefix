const session = require("express-session")
const MongoStore = require("connect-mongo")

const isProduction = process.env.NODE_ENV === "production"

const mongoStore = MongoStore.create({
  mongoUrl: "mongodb+srv://greendb:test11@greentrack.9xjck.mongodb.net/greentrack?retryWrites=true&w=majority",
  collectionName: "sessions",
  ttl: 24 * 60 * 60, // 1 day
  autoRemove: "native",
})

const sessionMiddleware = session({
  name: "greentrack.sid",
  secret: "greentrack-super-secret-key-123",
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    path: "/",
  },
})

module.exports = sessionMiddleware

