const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    shares: { type: Number, required: true, min: 1 },
    pricePerShareAtPurchase: { type: Number, required: true, min: 0 },
    amountInvested: { type: Number, required: true, min: 0 },
    ownershipPercent: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'exited'], default: 'active' },
    transactionId: { type: String, default: '' },
    totalDividendsReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
);

investmentSchema.index({ userId: 1, propertyId: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
