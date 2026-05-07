const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validateBody, validateObjectId } = require('../middlewares/validate');
const { expenseSchema } = require('../validations/expenseValidation');
const ctrl = require('../controllers/expenseController');

router.post('/', auth, validateBody(expenseSchema), ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/summary/monthly', auth, ctrl.monthlySummary);
router.get('/summary/categories', auth, ctrl.categorySummary);
router.put('/:id', auth, validateObjectId('id'), ctrl.update);
router.delete('/:id', auth, validateObjectId('id'), ctrl.remove);

module.exports = router;
