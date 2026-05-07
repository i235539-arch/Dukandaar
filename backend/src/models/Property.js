const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    propertyType: {
      type: String,
      enum: ['shop', 'office', 'plaza', 'mall', 'warehouse', 'apartment'],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    images: { type: [String], default: [] },

    totalValue: { type: Number, required: true, min: 1 },
    totalShares: { type: Number, required: true, min: 1 },
    pricePerShare: { type: Number, required: true, min: 1 },
    sharesAvailable: { type: Number, required: true, min: 0 },
    minSharesPerInvestor: { type: Number, default: 1, min: 1 },

    expectedAnnualYield: { type: Number, default: 0 },
    monthlyRent: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0, min: 0, max: 100 },

    status: { type: String, enum: ['draft', 'open', 'funded', 'closed'], default: 'open', index: true },
    isVerified: { type: Boolean, default: false },
    spvName: { type: String, default: '' },
    documentsUrl: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

propertySchema.virtual('sharesSold').get(function () {
  return this.totalShares - this.sharesAvailable;
});

propertySchema.virtual('fundingPercent').get(function () {
  if (!this.totalShares) return 0;
  return Math.round(((this.totalShares - this.sharesAvailable) / this.totalShares) * 100);
});

propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);
