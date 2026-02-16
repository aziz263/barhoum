const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rapportController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.post('/generate', authorize('medecin'), ctrl.generate);
router.get('/:id/download', ctrl.download);
router.delete('/:id', authorize('medecin', 'administrateur'), ctrl.remove);

module.exports = router;
