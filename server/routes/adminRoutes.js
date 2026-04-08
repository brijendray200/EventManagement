const express = require('express');
const { getUsers, deleteUser, getStats } = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes below
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;
