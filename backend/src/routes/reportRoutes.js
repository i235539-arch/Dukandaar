const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reportController');

router.get('/user-dashboard', auth, ctrl.userDashboard);
router.get('/income-expense', auth, ctrl.incomeExpense);
router.get('/budget-usage', auth, ctrl.budgetUsage);

module.exports = router;
