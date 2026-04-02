const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      // Snapshot fields to keep price/name/image at the time of order
      price: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        default: ''
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ""
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "cod"],
    default: "cod"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "verifying", "paid", "failed"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
    default: "pending"
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      time: { type: Date, default: Date.now },
      note: { type: String, default: "" }
    }
  ]
}, { timestamps: true });

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ phone: 1 });

module.exports = mongoose.model("Order", orderSchema);
