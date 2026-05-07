const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const notBlocked = require('../middlewares/notBlocked');
const { validateBody } = require('../middlewares/validate');
const { financialLimiter } = require('../middlewares/rateLimit');
const { depositSchema, withdrawSchema, transferSchema } = require('../validations/walletValidation');
const ctrl = require('../controllers/walletController');

router.get('/', auth, ctrl.getMyWallet);
router.get('/summary', auth, ctrl.getMySummary);

router.post('/deposit', auth, notBlocked, financialLimiter, validateBody(depositSchema), ctrl.deposit);
router.post('/withdraw', auth, notBlocked, financialLimiter, validateBody(withdrawSchema), ctrl.withdraw);
router.post('/transfer', auth, notBlocked, financialLimiter, validateBody(transferSchema), ctrl.transfer);

module.exports = router;
