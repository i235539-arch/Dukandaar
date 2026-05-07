const Notification = require('../models/Notification');

const notify = async ({ userId, title, message, type = 'system', relatedTransactionId = '', relatedPropertyId = null }) => {
  try {
    await Notification.create({ userId, title, message, type, relatedTransactionId, relatedPropertyId });
  } catch (err) {
    console.error('Notification create failed:', err.message);
  }
};

module.exports = notify;
