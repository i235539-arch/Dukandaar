const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const owns = require('../middlewares/ownership');
const { validateBody, validateObjectId } = require('../middlewares/validate');
const { budgetSchema } = require('../validations/budgetValidation');
const Budget = require('../models/Budget');
const ctrl = require('../controllers/budgetController');

router.post('/', auth, validateBody(budgetSchema), ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/current', auth, ctrl.current);
router.put('/:id', auth, validateObjectId('id'), owns(Budget), ctrl.update);
router.delete('/:id', auth, validateObjectId('id'), owns(Budget), ctrl.remove);

module.exports = router;
