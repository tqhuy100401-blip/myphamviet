const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên là bắt buộc"],
    trim: true,
    minlength: [2, "Tên phải có ít nhất 2 ký tự"],
    maxlength: [50, "Tên không được quá 50 ký tự"]
  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email không hợp lệ"
    ]
  },
  password: {
    type: String,
    required: [true, "Mật khẩu là bắt buộc"],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    select: false // Không trả về password khi query
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationExpires: {
    type: Date,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance (email already has unique index from schema)
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock the account if we've reached max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model("User", userSchema);
