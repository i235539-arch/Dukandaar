const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validateObjectId } = require('../middlewares/validate');
const ctrl = require('../controllers/notificationController');

router.get('/', auth, ctrl.list);
router.patch('/read-all', auth, ctrl.markAllRead);
router.patch('/:id/read', auth, validateObjectId('id'), ctrl.markRead);

module.exports = router;
