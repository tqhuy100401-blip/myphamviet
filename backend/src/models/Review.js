const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index để đảm bảo 1 user chỉ review 1 lần cho 1 sản phẩm
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
