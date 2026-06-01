const mongoose = require('mongoose');

const targetPageSchema = new mongoose.Schema({
  anchor: { type: String, required: true },
  url:    { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  websiteId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  projectId:   { type: String, required: true },

  price:    { type: Number, required: true },
  currency: { type: String, default: 'USD' },

  articleTitle:        { type: String },
  articleContent:      { type: String },
  wordCount:           { type: Number, default: 500 },
  targetPages:         [targetPageSchema],
  publishInstructions: { type: String },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'review', 'completed', 'rejected', 'cancelled', 'disputed'],
    default: 'pending',
  },

  publishedUrl:  { type: String },
  publishedDate: { type: Date },

  rejectionReason:    { type: String },
  cancellationReason: { type: String },

  acceptedAt:  { type: Date },
  completedAt: { type: Date },
  rejectedAt:  { type: Date },
  cancelledAt: { type: Date },

  revisions: [{
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:        { type: String },
    createdAt:   { type: Date, default: Date.now },
  }],
}, { timestamps: true });

orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ publisherId: 1, status: 1 });
orderSchema.index({ projectId: 1 });

module.exports = mongoose.model('Order', orderSchema);