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
