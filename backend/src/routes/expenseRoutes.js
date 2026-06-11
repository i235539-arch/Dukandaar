const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const owns = require('../middlewares/ownership');
const { validateBody, validateObjectId } = require('../middlewares/validate');
const { expenseSchema } = require('../validations/expenseValidation');
const Expense = require('../models/Expense');
const ctrl = require('../controllers/expenseController');

router.post('/', auth, validateBody(expenseSchema), ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/summary/monthly', auth, ctrl.monthlySummary);
router.get('/summary/categories', auth, ctrl.categorySummary);
router.put('/:id', auth, validateObjectId('id'), owns(Expense), ctrl.update);
router.delete('/:id', auth, validateObjectId('id'), owns(Expense), ctrl.remove);

module.exports = router;
