const Order = require('../models/Order');
const mongoose = require('mongoose');

// ─── BUYER: Place a new order ────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const {
      publisherId, websiteId, projectId,
      price, articleTitle, articleContent,
      wordCount, targetPages, publishInstructions,
    } = req.body;

    if (!publisherId || !websiteId || !projectId || !price) {
      return res.status(400).json({ success: false, message: 'publisherId, websiteId, projectId and price are required.' });
    }

    const order = await Order.create({
      buyerId, publisherId, websiteId, projectId,
      price, articleTitle, articleContent,
      wordCount, targetPages, publishInstructions,
      status: 'pending',
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BUYER: Get all my orders ─────────────────────────────────────────────────
const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { status, projectId, page = 1, limit = 20 } = req.query;

    const filter = { buyerId };
    if (status)    filter.status    = status;
    if (projectId) filter.projectId = projectId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('websiteId', 'domain niche da')
        .populate('publisherId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLISHER: Get all incoming orders ──────────────────────────────────────
const getPublisherOrders = async (req, res) => {
  try {
    const publisherId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { publisherId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('websiteId', 'domain niche da')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SHARED: Get single order ─────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('websiteId', 'domain niche da traffic')
      .populate('buyerId', 'name email')
      .populate('publisherId', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isAuthorized = order.buyerId._id.equals(userId) || order.publisherId._id.equals(userId);
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Not authorized.' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLISHER: Accept order ──────────────────────────────────────────────────
const acceptOrder = async (req, res) => {
  try {
    const publisherId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, publisherId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept order with status: ${order.status}` });
    }

    order.status     = 'accepted';
    order.acceptedAt = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLISHER: Reject order ──────────────────────────────────────────────────
const rejectOrder = async (req, res) => {
  try {
    const publisherId = req.user._id;
    const { orderId } = req.params;
    const { reason }  = req.body;

    const order = await Order.findOne({ _id: orderId, publisherId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject order with status: ${order.status}` });
    }

    order.status          = 'rejected';
    order.rejectionReason = reason || '';
    order.rejectedAt      = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLISHER: Mark as published ────────────────────────────────────────────
const markAsPublished = async (req, res) => {
  try {
    const publisherId = req.user._id;
    const { orderId } = req.params;
    const { publishedUrl } = req.body;

    if (!publishedUrl) return res.status(400).json({ success: false, message: 'publishedUrl is required.' });

    const order = await Order.findOne({ _id: orderId, publisherId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (!['accepted', 'in_progress'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot submit from status: ${order.status}` });
    }

    order.status        = 'review';
    order.publishedUrl  = publishedUrl;
    order.publishedDate = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BUYER: Complete order ────────────────────────────────────────────────────
const completeOrder = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'review') {
      return res.status(400).json({ success: false, message: `Order must be in review to complete. Current: ${order.status}` });
    }

    order.status      = 'completed';
    order.completedAt = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BUYER: Cancel order ──────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { orderId } = req.params;
    const { reason }  = req.body;

    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });
    }

    order.status             = 'cancelled';
    order.cancellationReason = reason || '';
    order.cancelledAt        = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BUYER: Request revision ──────────────────────────────────────────────────
const requestRevision = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { orderId } = req.params;
    const { note } = req.body;

    if (!note) return res.status(400).json({ success: false, message: 'Revision note is required.' });

    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'review') {
      return res.status(400).json({ success: false, message: 'Can only request revision when order is in review.' });
    }

    order.status = 'in_progress';
    order.revisions.push({ requestedBy: buyerId, note });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SHARED: Order stats ──────────────────────────────────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role   = req.user.role;

    const matchField = role === 'buyer' ? 'buyerId' : 'publisherId';

    const stats = await Order.aggregate([
      { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$price' } } },
    ]);

    const result = { pending: 0, accepted: 0, in_progress: 0, review: 0, completed: 0, rejected: 0, cancelled: 0 };
    let totalSpent = 0;

    stats.forEach(s => {
      result[s._id] = s.count;
      if (s._id === 'completed') totalSpent += s.totalValue;
    });

    res.json({ success: true, stats: result, totalSpent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};