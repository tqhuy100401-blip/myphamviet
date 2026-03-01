const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: "FiTag"
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
