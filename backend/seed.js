require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User.model");

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Remove old users (optional)
    await User.deleteMany({});

    // Create HR user
    const admin = new User({
      username: "admin",
      email: "admin@example.com",
      name: "Administrator",
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "hr",
    });

    // Create Employee
    const employee = new User({
      username: "emp001",
      email: "emp001@example.com",
      name: "John Doe",
      password: await bcrypt.hash(process.env.EMPLOYEE_PASSWORD, 10),
      role: "employee",
      employeeId: "EMP001",
    });

    await admin.save();
    await employee.save();

    console.log("✅ Users inserted successfully");

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

seed();