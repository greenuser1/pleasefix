const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")
const { generateToken, verifyToken } = require("../utils/token")

// Session test endpoint
router.get("/session-test", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1
  } else {
    req.session.views++
  }

  // Force save the session
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err)
    }

    res.json({
      sessionId: req.session.id,
      views: req.session.views,
      user: req.session.user || null,
    })
  })
})

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with that email or username",
      })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
      username,
      email,
      passwordHash,
    })

    await user.save()

    const userData = {
      id: user._id.toString(),
      username: user.username,
    }

    req.session.user = userData

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err)
        return res.status(500).json({ message: "Session error" })
      }

      // Generate token as fallback
      const token = generateToken(userData)

      // Explicitly set cookie
      res.cookie("greentrack.sid", req.sessionID, {
        httpOnly: true,
        secure: false, // Set to false for now
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      // Set token cookie
      res.cookie("greentrack.token", token, {
        httpOnly: false, // Allow JavaScript to read this cookie
        secure: false, // Set to false for now
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      res.status(201).json({
        message: "User registered successfully",
        user: userData,
        token: token, // Include token in response
      })
    })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const userData = {
      id: user._id.toString(),
      username: user.username,
    }

    req.session.user = userData

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err)
        return res.status(500).json({ message: "Session error" })
      }

      // Generate token as fallback
      const token = generateToken(userData)

      // Explicitly set cookie
      res.cookie("greentrack.sid", req.sessionID, {
        httpOnly: true,
        secure: false, // Set to false for now
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      // Set token cookie
      res.cookie("greentrack.token", token, {
        httpOnly: false, // Allow JavaScript to read this cookie
        secure: false, // Set to false for now
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      res.json({
        message: "Logged in successfully",
        user: userData,
        token: token, // Include token in response
      })
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: err.message })
  }
})

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("greentrack.sid", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "none",
    })
    res.clearCookie("greentrack.token", {
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "none",
    })
    res.json({ message: "Logged out successfully" })
  })
})

router.get("/me", (req, res) => {
  if (req.session.user) {
    return res.json({
      user: req.session.user,
      sessionId: req.session.id,
    })
  }

  // If no session, check for token in cookies or Authorization header
  const token =
    req.cookies["greentrack.token"] || (req.headers.authorization && req.headers.authorization.split(" ")[1])

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  // Verify token
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" })
  }

  // Set user in session for future requests
  req.session.user = {
    id: decoded.id,
    username: decoded.username,
  }

  req.session.save()

  return res.json({
    user: decoded,
    tokenBased: true,
  })
})

module.exports = router

