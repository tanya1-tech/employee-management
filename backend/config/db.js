const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected successfully`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
  console.error("MongoDB Error:");
  console.error(error);
}
};

module.exports = connectDB;