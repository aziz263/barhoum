const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('medecin', 'infirmier', 'administrateur'), ctrl.create);
router.put('/:id', authorize('medecin', 'infirmier', 'administrateur'), ctrl.update);
router.delete('/:id', authorize('medecin', 'administrateur'), ctrl.remove);

module.exports = router;
