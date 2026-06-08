const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;