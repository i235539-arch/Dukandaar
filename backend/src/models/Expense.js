const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ['Wallet', 'Cash', 'Card', 'Bank Transfer', 'Other'],
      default: 'Wallet',
    },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
