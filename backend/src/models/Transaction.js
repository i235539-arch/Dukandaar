const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer', 'investment', 'dividend', 'refund', 'fee'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'flagged'],
      default: 'pending',
      index: true,
    },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    suspiciousFlag: { type: Boolean, default: false, index: true },
    suspiciousReasons: { type: [String], default: [] },
    failureReason: { type: String, default: '' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
