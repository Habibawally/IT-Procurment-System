const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

router.get('/', authenticate, getUsers);

module.exports = router;