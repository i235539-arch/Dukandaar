const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validateBody, validateObjectId } = require('../middlewares/validate');
const { budgetSchema } = require('../validations/budgetValidation');
const ctrl = require('../controllers/budgetController');

router.post('/', auth, validateBody(budgetSchema), ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/current', auth, ctrl.current);
router.put('/:id', auth, validateObjectId('id'), ctrl.update);
router.delete('/:id', auth, validateObjectId('id'), ctrl.remove);

module.exports = router;
