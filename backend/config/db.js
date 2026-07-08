const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected successfully`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.log(`⚠️ MongoDB connection failed: ${error.message}`);
    console.log('💡 Running with limited functionality (no database)');
    return null;
  }
};

module.exports = connectDB;