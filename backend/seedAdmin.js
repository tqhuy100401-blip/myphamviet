require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Cập nhật cả 2 email admin có thể có
  const adminEmails = ["admin@gmail.com", "admin@myphamviet.com"];
  
  for (const email of adminEmails) {
    const exists = await User.findOne({ email });
    
    if (exists) {
      console.log("Admin da ton tai:", exists.email, "- role:", exists.role);
      let updated = false;
      
      if (exists.role !== "admin") {
        exists.role = "admin";
        updated = true;
        console.log("Da cap nhat role thanh admin");
      }
      
      if (!exists.isVerified) {
        exists.isVerified = true;
        updated = true;
        console.log("Da cap nhat isVerified = true cho admin");
      }
      
      if (updated) {
        await exists.save();
      }
    }
  }
  
  // Tạo admin mặc định nếu chưa có
  const exists = await User.findOne({ email: "admin@gmail.com" });
  
  if (!exists) {
    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hash,
      role: "admin",
      isVerified: true, // Admin không cần verify OTP
    });
    console.log("Tao tai khoan admin thanh cong!");
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seedAdmin();
