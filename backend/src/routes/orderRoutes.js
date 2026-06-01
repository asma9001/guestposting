const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getBuyerOrders,
  getPublisherOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  markAsPublished,
  completeOrder,
  cancelOrder,
  requestRevision,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require login
router.use(protect);

// ── Shared (buyer + publisher both) ─────────────────────────
router.get('/stats',                          getOrderStats);
router.get('/publisher/inbox',                restrictTo('publisher'), getPublisherOrders);
router.get('/:orderId',                       getOrderById);

// ── Advertiser (Buyer) only ──────────────────────────────────
router.post('/',                              restrictTo('advertiser'), placeOrder);
router.get('/',                               restrictTo('advertiser'), getBuyerOrders);
router.patch('/:orderId/complete',            restrictTo('advertiser'), completeOrder);
router.patch('/:orderId/cancel',              restrictTo('advertiser'), cancelOrder);
router.patch('/:orderId/request-revision',    restrictTo('advertiser'), requestRevision);

// ── Publisher only ───────────────────────────────────────────
router.patch('/:orderId/accept',              restrictTo('publisher'), acceptOrder);
router.patch('/:orderId/reject',              restrictTo('publisher'), rejectOrder);
router.patch('/:orderId/mark-published',      restrictTo('publisher'), markAsPublished);

module.exports = router;