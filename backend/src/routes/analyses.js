const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyseController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('technicien'), ctrl.create);
router.post('/:id/resultat', authorize('technicien'), ctrl.addResultat);
router.delete('/:id', authorize('technicien', 'administrateur'), ctrl.remove);

module.exports = router;
