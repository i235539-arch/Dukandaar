const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail, AppError } = require('../utils/response');
const generateTransactionId = require('../utils/transactionId');
const suspicious = require('../utils/suspiciousRules');
const notify = require('../utils/notify');

const LOW_BALANCE_THRESHOLD = 1000;

exports.getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) throw new AppError('Wallet not found', 404);
  return ok(res, { wallet });
});

exports.getMySummary = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) throw new AppError('Wallet not found', 404);

  const [last5] = await Promise.all([
    Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return ok(res, { wallet, recent: last5 });
});

exports.deposit = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const description = req.body.description || 'Wallet deposit';

  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) throw new AppError('Wallet not found', 404);
  if (wallet.status !== 'active') return fail(res, 'Wallet is frozen', 403);

  const susp = await suspicious.evaluate({ user: req.user, type: 'deposit', amount });
  const status = susp.suspiciousFlag ? 'flagged' : 'successful';

  // Even when flagged we still credit the wallet but mark for review.
  wallet.balance += amount;
  wallet.totalDeposits += amount;
  await wallet.save();

  const tx = await Transaction.create({
    transactionId: generateTransactionId(),
    senderId: null,
    receiverId: req.user._id,
    amount,
    type: 'deposit',
    status,
    description,
    suspiciousFlag: susp.suspiciousFlag,
    suspiciousReasons: susp.reasons,
  });

  await notify({
    userId: req.user._id,
    title: status === 'flagged' ? 'Deposit flagged for review' : 'Deposit successful',
    message: `PKR ${amount.toLocaleString()} ${status === 'flagged' ? 'was credited and flagged for admin review.' : 'has been credited to your wallet.'}`,
    type: 'transaction',
    relatedTransactionId: tx.transactionId,
  });

  return ok(res, { wallet, transaction: tx }, 'Deposit recorded');
});

exports.withdraw = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const description = req.body.description || 'Wallet withdrawal';

  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) throw new AppError('Wallet not found', 404);
  if (wallet.status !== 'active') return fail(res, 'Wallet is frozen', 403);

  if (wallet.balance < amount) {
    // Record failed transaction for monitoring
    const failedTx = await Transaction.create({
      transactionId: generateTransactionId(),
      senderId: req.user._id,
      receiverId: null,
      amount,
      type: 'withdrawal',
      status: 'failed',
      description,
      failureReason: 'Insufficient balance',
    });

    // Re-evaluate after this failed tx so consecutive failures trip the rule
    const susp = await suspicious.evaluate({ user: req.user, type: 'withdrawal', amount });
    if (susp.suspiciousFlag) {
      failedTx.suspiciousFlag = true;
      failedTx.suspiciousReasons = susp.reasons;
      await failedTx.save();
    }

    await notify({
      userId: req.user._id,
      title: 'Withdrawal failed',
      message: `Insufficient balance for withdrawal of PKR ${amount.toLocaleString()}.`,
      type: 'transaction',
      relatedTransactionId: failedTx.transactionId,
    });

    return fail(res, 'Insufficient balance', 400);
  }

  const susp = await suspicious.evaluate({ user: req.user, type: 'withdrawal', amount });
  const status = susp.suspiciousFlag ? 'flagged' : 'successful';

  wallet.balance -= amount;
  wallet.totalWithdrawals += amount;
  await wallet.save();

  const tx = await Transaction.create({
    transactionId: generateTransactionId(),
    senderId: req.user._id,
    receiverId: null,
    amount,
    type: 'withdrawal',
    status,
    description,
    suspiciousFlag: susp.suspiciousFlag,
    suspiciousReasons: susp.reasons,
  });

  await notify({
    userId: req.user._id,
    title: status === 'flagged' ? 'Withdrawal flagged' : 'Withdrawal successful',
    message: `PKR ${amount.toLocaleString()} withdrawn from your wallet.`,
    type: 'transaction',
    relatedTransactionId: tx.transactionId,
  });

  if (wallet.balance < LOW_BALANCE_THRESHOLD) {
    await notify({
      userId: req.user._id,
      title: 'Low wallet balance',
      message: `Your wallet balance is below PKR ${LOW_BALANCE_THRESHOLD}.`,
      type: 'account',
    });
  }

  return ok(res, { wallet, transaction: tx }, 'Withdrawal recorded');
});

exports.transfer = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const receiverEmail = String(req.body.receiverEmail).toLowerCase().trim();
  const description = req.body.description || 'P2P transfer';

  if (req.user.email === receiverEmail) {
    return fail(res, 'Self-transfer is not allowed', 400);
  }

  const receiver = await User.findOne({ email: receiverEmail });
  if (!receiver) return fail(res, 'Receiver not found', 404);
  if (receiver.status === 'blocked') return fail(res, 'Receiver account is blocked', 403);

  const senderWallet = await Wallet.findOne({ userId: req.user._id });
  const receiverWallet = await Wallet.findOne({ userId: receiver._id });
  if (!senderWallet || !receiverWallet) throw new AppError('Wallet not found', 404);
  if (senderWallet.status !== 'active') return fail(res, 'Your wallet is frozen', 403);

  if (senderWallet.balance < amount) {
    const failedTx = await Transaction.create({
      transactionId: generateTransactionId(),
      senderId: req.user._id,
      receiverId: receiver._id,
      amount,
      type: 'transfer',
      status: 'failed',
      description,
      failureReason: 'Insufficient balance',
    });
    return fail(res, 'Insufficient balance', 400);
  }

  const susp = await suspicious.evaluate({ user: req.user, type: 'transfer', amount });
  const status = susp.suspiciousFlag ? 'flagged' : 'successful';

  // Update both wallets carefully
  senderWallet.balance -= amount;
  senderWallet.totalTransfersOut += amount;
  receiverWallet.balance += amount;
  receiverWallet.totalTransfersIn += amount;
  await senderWallet.save();
  await receiverWallet.save();

  const tx = await Transaction.create({
    transactionId: generateTransactionId(),
    senderId: req.user._id,
    receiverId: receiver._id,
    amount,
    type: 'transfer',
    status,
    description,
    suspiciousFlag: susp.suspiciousFlag,
    suspiciousReasons: susp.reasons,
  });

  await Promise.all([
    notify({
      userId: req.user._id,
      title: status === 'flagged' ? 'Transfer flagged' : 'Transfer sent',
      message: `PKR ${amount.toLocaleString()} sent to ${receiver.email}.`,
      type: 'transaction',
      relatedTransactionId: tx.transactionId,
    }),
    notify({
      userId: receiver._id,
      title: 'Transfer received',
      message: `PKR ${amount.toLocaleString()} received from ${req.user.email}.`,
      type: 'transaction',
      relatedTransactionId: tx.transactionId,
    }),
  ]);

  if (senderWallet.balance < LOW_BALANCE_THRESHOLD) {
    await notify({
      userId: req.user._id,
      title: 'Low wallet balance',
      message: `Your balance is below PKR ${LOW_BALANCE_THRESHOLD}.`,
      type: 'account',
    });
  }

  return ok(res, { wallet: senderWallet, transaction: tx }, 'Transfer completed');
});
