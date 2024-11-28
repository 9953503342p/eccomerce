const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true }, // Razorpay order ID
    paymentId: { type: String },              // Razorpay payment ID (if successful)
    signature: { type: String },              // Razorpay signature (if verified)
    amount: { type: Number, required: true }, // Payment amount
    currency: { type: String, required: true }, // Payment currency
    receipt: { type: String, required: true }, // Receipt ID
    status: { type: String, default: 'Pending' }, // Payment status: 'Pending', 'Success', 'Failed'
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
