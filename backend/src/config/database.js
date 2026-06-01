const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Successfully connected!");
  } catch (err) {
    console.error("DEBUG ERROR:", err.message);
  }
}

module.exports = connectDB;
