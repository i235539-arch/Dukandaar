const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { validateObjectId } = require('../middlewares/validate');
const ctrl = require('../controllers/adminController');
const catCtrl = require('../controllers/categoryController');

router.use(auth, role('admin'));

router.get('/dashboard', ctrl.dashboard);

router.get('/users', ctrl.listUsers);
router.get('/users/:id', validateObjectId('id'), ctrl.getUser);
router.patch('/users/:id/block', validateObjectId('id'), ctrl.blockUser);
router.patch('/users/:id/unblock', validateObjectId('id'), ctrl.unblockUser);

router.get('/wallets', ctrl.listWallets);

router.get('/transactions', ctrl.listAllTransactions);
router.get('/transactions/flagged', ctrl.flaggedTransactions);

router.get('/reports/transaction-volume', ctrl.transactionVolume);
router.get('/reports/system-balance', ctrl.systemBalance);

router.get('/categories', catCtrl.adminList);
router.post('/categories', catCtrl.adminCreate);
router.put('/categories/:id', validateObjectId('id'), catCtrl.adminUpdate);
router.patch('/categories/:id/disable', validateObjectId('id'), catCtrl.adminDisable);

router.get('/audit-logs', ctrl.auditLogs);

module.exports = router;
