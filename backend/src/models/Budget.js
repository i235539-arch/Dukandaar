const mongoose = require('mongoose');

const categoryLimitSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    totalLimit: { type: Number, required: true, min: 0.01 },
    categoryLimits: { type: [categoryLimitSchema], default: [] },
    spentAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['safe', 'nearLimit', 'exceeded'],
      default: 'safe',
    },
    warningThreshold: { type: Number, default: 80, min: 1, max: 100 },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
