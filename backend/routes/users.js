const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

// The user directory is only for reviewer roles, not employees.
router.get('/', authenticate, authorize('manager', 'it', 'procurement'), getUsers);

module.exports = router;