const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/logController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Seul l'admin peut voir les journaux
router.get('/', authorize('administrateur'), ctrl.getAll);
router.get('/stats', authorize('administrateur'), ctrl.getStats);

module.exports = router;
