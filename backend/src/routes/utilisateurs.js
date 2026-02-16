const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/utilisateurController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('administrateur'), ctrl.create);
router.put('/:id', authorize('administrateur'), ctrl.update);
router.delete('/:id', authorize('administrateur'), ctrl.remove);

module.exports = router;
