const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dossierController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/csv', authorize('medecin'), ctrl.exportCSV);
router.post('/', authorize('medecin'), ctrl.create);
router.put('/:id', authorize('medecin'), ctrl.update);
router.delete('/:id', authorize('medecin', 'administrateur'), ctrl.remove);

module.exports = router;
