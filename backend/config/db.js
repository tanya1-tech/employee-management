const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'employee_management', // Important! Creates/uses this database
      useNewUrlParser: true,
      useUnifiedTopology: true,
        timezone: 'Asia/Kolkata',
    });
    
    console.log(`✅ MongoDB connected successfully`);
    console.log(`📊 Database: ${conn.connection.db.databaseName}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error.message);
    console.error(`💡 Please check your MONGODB_URI in .env file`);
    // Don't exit process in production
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;