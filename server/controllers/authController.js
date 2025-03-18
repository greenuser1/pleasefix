const User = require("../models/User")
const bcrypt = require("bcrypt")

exports.registerUser = async (req, res) => {
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

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

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
        sessionId: req.session.id,
      })
    })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: err.message })
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

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
        sessionId: req.session.id,
      })
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: err.message })
  }
}

exports.getCurrentUser = (req, res) => {
  console.log("GET /api/auth/me - Session:", req.session.id)
  console.log("User in session:", req.session.user || "none")

  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  res.json({
    user: req.session.user,
    sessionId: req.session.id,
  })
}

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("greentrack.sid")
    res.json({ message: "Logged out successfully" })
  })
}

exports.sessionTest = (req, res) => {
  if (!req.session.views) {
    req.session.views = 1
  } else {
    req.session.views++
  }

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err)
      return res.status(500).json({ message: "Session error" })
    }

    res.json({
      sessionId: req.session.id,
      views: req.session.views,
      user: req.session.user || null,
    })
  })
}

