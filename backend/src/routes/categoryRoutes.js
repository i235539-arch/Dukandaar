const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/categoryController');

router.get('/', auth, ctrl.list);

module.exports = router;
