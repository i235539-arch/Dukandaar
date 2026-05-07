const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimit');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validations/authValidation');

router.post('/register', authLimiter, validateBody(registerSchema), ctrl.register);
router.post('/login', authLimiter, validateBody(loginSchema), ctrl.login);
router.post('/logout', auth, ctrl.logout);
router.get('/me', auth, ctrl.me);
router.put('/change-password', auth, validateBody(changePasswordSchema), ctrl.changePassword);

module.exports = router;
