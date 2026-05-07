const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const notBlocked = require('../middlewares/notBlocked');
const { validateBody, validateObjectId } = require('../middlewares/validate');
const { financialLimiter } = require('../middlewares/rateLimit');
const { propertySchema, investSchema } = require('../validations/propertyValidation');
const ctrl = require('../controllers/propertyController');

// Public listing endpoints (also accessible to logged-in users)
router.get('/', ctrl.listPublic);
router.get('/me/investments', auth, ctrl.myInvestments);
router.get('/:id', validateObjectId('id'), ctrl.getById);

// Invest
router.post(
  '/:id/invest',
  auth,
  notBlocked,
  financialLimiter,
  validateObjectId('id'),
  validateBody(investSchema),
  ctrl.invest
);

// Admin
router.post('/', auth, role('admin'), validateBody(propertySchema), ctrl.adminCreate);
router.put('/:id', auth, role('admin'), validateObjectId('id'), ctrl.adminUpdate);
router.delete('/:id', auth, role('admin'), validateObjectId('id'), ctrl.adminDelete);
router.patch('/:id/verify', auth, role('admin'), validateObjectId('id'), ctrl.adminVerify);
router.post('/:id/pay-dividend', auth, role('admin'), validateObjectId('id'), ctrl.adminPayDividend);

module.exports = router;
