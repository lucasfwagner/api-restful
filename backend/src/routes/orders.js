const express = require('express');
const router = express.Router();
const { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder, getOrderProducts } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, listOrders);
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrder);
router.put('/:id', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/:id/products', authMiddleware, getOrderProducts);

module.exports = router;