const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    
    const mongoURI = "mongodb+srv://greendb:test11@greentrack.9xjck.mongodb.net/greentrack?retryWrites=true&w=majority"
    await mongoose.connect(mongoURI)
    console.log("MongoDB connected successfully")
  } catch (err) {
    console.error("MongoDB connection error:", err.message)
    process.exit(1)
  }
}

module.exports = connectDB

