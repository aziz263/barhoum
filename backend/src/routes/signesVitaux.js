const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/signesVitauxController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('infirmier'), ctrl.create);
router.delete('/:id', authorize('infirmier', 'administrateur'), ctrl.remove);

module.exports = router;
