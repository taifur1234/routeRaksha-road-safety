import mongoose from "mongoose";

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/black-spot-ai";

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

function getMongoStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  return {
    state: states[mongoose.connection.readyState] || "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

export { connectDB, getMongoStatus };
