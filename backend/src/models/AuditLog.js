const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    targetType: {
      type: String,
      enum: ['user', 'wallet', 'transaction', 'property', 'category', 'system'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.Mixed, default: null },
    details: { type: Object, default: {} },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
