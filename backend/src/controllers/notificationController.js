const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  const unread = await Notification.countDocuments({ userId: req.user._id, readStatus: false });
  return ok(res, { items, unread });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findById(req.params.id);
  if (!n) return fail(res, 'Notification not found', 404);
  if (n.userId.toString() !== req.user._id.toString()) return fail(res, 'Forbidden', 403);
  n.readStatus = true;
  await n.save();
  return ok(res, { notification: n }, 'Marked as read');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const r = await Notification.updateMany(
    { userId: req.user._id, readStatus: false },
    { $set: { readStatus: true } }
  );
  return ok(res, { modified: r.modifiedCount }, 'All notifications marked read');
});
