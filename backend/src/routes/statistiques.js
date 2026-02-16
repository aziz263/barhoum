const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statistiqueController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getDashboard);

module.exports = router;
