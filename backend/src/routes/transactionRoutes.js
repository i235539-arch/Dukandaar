const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validateObjectId } = require('../middlewares/validate');
const ctrl = require('../controllers/transactionController');

router.get('/', auth, ctrl.list);
router.get('/summary/monthly', auth, ctrl.monthlySummary);
router.get('/:id', auth, validateObjectId('id'), ctrl.getOne);
router.get('/:id/receipt', auth, validateObjectId('id'), ctrl.receipt);

module.exports = router;
