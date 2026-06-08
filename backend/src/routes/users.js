const express = require('express');
const router = express.Router();
const { getMe, updateMe, listUsers } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.get('/', authMiddleware, adminMiddleware, listUsers);

module.exports = router;