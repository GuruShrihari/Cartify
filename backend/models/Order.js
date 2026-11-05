const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      emailId: { type: String, required: true, lowercase: true, trim: true },
      username: { type: String, required: true },
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    shippingAddress: {
      fullName: { type: String, default: 'Customer' },
      addressLine: { type: String, default: 'Address Line' },
      city: { type: String, default: 'Chennai' },
      state: { type: String, default: 'Tamil Nadu' },
      postalCode: { type: String, default: '600001' },
      phone: { type: String, default: '9876543210' },
    },
    payment: {
      gateway: { type: String, default: 'razorpay' },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
    },
    fulfillmentStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailReceiptId: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'Orders',
  }
);

module.exports = mongoose.model('Order', orderSchema);
