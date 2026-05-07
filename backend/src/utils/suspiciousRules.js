const Transaction = require('../models/Transaction');

// Rule thresholds (kept here for explainability during viva)
const RULES = {
  HIGH_VALUE_THRESHOLD: 100000,        // PKR 100,000
  HIGH_DEPOSIT_THRESHOLD: 500000,      // PKR 500,000
  RAPID_TX_WINDOW_MIN: 10,
  RAPID_TX_COUNT: 5,
  FAILED_WITHDRAWAL_DAY_LIMIT: 3,
  REPEAT_AMOUNT_WINDOW_HOURS: 24,
  REPEAT_AMOUNT_MIN_OCCURRENCES: 3,
  NEW_USER_HOURS: 24,
  NEW_USER_HIGH_VALUE: 50000,
};

/**
 * Evaluate a candidate transaction against backend suspicious rules.
 * Returns { suspiciousFlag, reasons[] }.
 *
 * Required by spec: at least 5 backend rules. We implement 7 rules below:
 *   1. Transfer / withdrawal above HIGH_VALUE_THRESHOLD
 *   2. More than RAPID_TX_COUNT transfers within RAPID_TX_WINDOW_MIN minutes
 *   3. More than FAILED_WITHDRAWAL_DAY_LIMIT failed withdrawals in 24h
 *   4. Same amount transferred repeatedly (REPEAT_AMOUNT_MIN_OCCURRENCES times) in 24h
 *   5. High-value transaction by newly registered user (< NEW_USER_HOURS old)
 *   6. Deposit above HIGH_DEPOSIT_THRESHOLD
 *   7. Action attempted by a blocked user
 */
const evaluate = async ({ user, type, amount }) => {
  const reasons = [];
  const userId = user._id;

  // Rule 7 — blocked user
  if (user.status === 'blocked') {
    reasons.push('Action attempted by blocked user');
  }

  // Rule 1 — high-value transfer/withdrawal
  if ((type === 'transfer' || type === 'withdrawal' || type === 'investment') && amount >= RULES.HIGH_VALUE_THRESHOLD) {
    reasons.push(`High-value ${type} above PKR ${RULES.HIGH_VALUE_THRESHOLD}`);
  }

  // Rule 6 — high deposit
  if (type === 'deposit' && amount >= RULES.HIGH_DEPOSIT_THRESHOLD) {
    reasons.push(`Deposit above PKR ${RULES.HIGH_DEPOSIT_THRESHOLD}`);
  }

  // Rule 2 — too many transfers in a small window
  if (type === 'transfer') {
    const windowStart = new Date(Date.now() - RULES.RAPID_TX_WINDOW_MIN * 60 * 1000);
    const recentCount = await Transaction.countDocuments({
      senderId: userId,
      type: 'transfer',
      createdAt: { $gte: windowStart },
    });
    if (recentCount >= RULES.RAPID_TX_COUNT) {
      reasons.push(`More than ${RULES.RAPID_TX_COUNT} transfers within ${RULES.RAPID_TX_WINDOW_MIN} minutes`);
    }
  }

  // Rule 3 — failed withdrawals in last 24h
  if (type === 'withdrawal') {
    const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failed = await Transaction.countDocuments({
      senderId: userId,
      type: 'withdrawal',
      status: 'failed',
      createdAt: { $gte: dayStart },
    });
    if (failed >= RULES.FAILED_WITHDRAWAL_DAY_LIMIT) {
      reasons.push(`More than ${RULES.FAILED_WITHDRAWAL_DAY_LIMIT} failed withdrawals in last 24h`);
    }
  }

  // Rule 4 — same amount transferred repeatedly
  if (type === 'transfer') {
    const windowStart = new Date(Date.now() - RULES.REPEAT_AMOUNT_WINDOW_HOURS * 60 * 60 * 1000);
    const sameAmount = await Transaction.countDocuments({
      senderId: userId,
      type: 'transfer',
      amount,
      createdAt: { $gte: windowStart },
    });
    if (sameAmount + 1 >= RULES.REPEAT_AMOUNT_MIN_OCCURRENCES) {
      reasons.push(`Same amount (PKR ${amount}) transferred ${sameAmount + 1} times in 24h`);
    }
  }

  // Rule 5 — new user, high-value tx
  const ageMs = Date.now() - new Date(user.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < RULES.NEW_USER_HOURS && amount >= RULES.NEW_USER_HIGH_VALUE) {
    reasons.push(`High-value ${type} by newly registered user (< ${RULES.NEW_USER_HOURS}h old)`);
  }

  return { suspiciousFlag: reasons.length > 0, reasons };
};

module.exports = { evaluate, RULES };
