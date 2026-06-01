const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
 required: true,
    },

    role: {
      type: String,
      enum: {
        values: ['advertiser', 'publisher'],
        message: 'Role must be either advertiser or publisher',
      },
      default: 'advertiser',
    },

    avatar: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ─── Personal Info ────────────────────────────────────
    phone: {
      type: String,
      default: null,
    },

    phoneCode: {
      type: String,
      default: '+1',
    },

    timezone: {
      type: String,
      default: 'utc-5',
    },

    currency: {
      type: String,
      default: 'USD',
    },

    // ─── Wallet ───────────────────────────────────────────
    walletBalance: {
      type: Number,
      default: 0,
    },

    onHoldAmount: {
      type: Number,
      default: 0,
    },

    awaitingClearanceAmount: {
      type: Number,
      default: 0,
    },


    // ─── Payment Methods ──────────────────────────────────
    paymentMethods: [
      {
        type:      { type: String, enum: ['paypal', 'crypto', 'bank'], required: true },
        label:     { type: String },          // e.g. "PayPal", "USDT Wallet"
        value:     { type: String },          // email or wallet address
        isDefault: { type: Boolean, default: false },
      },
    ],

    // ─── Ratings / Reviews ────────────────────────────────
    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // ─── Notifications ────────────────────────────────────
    unreadNotifications: {
      type: Number,
      default: 0,
    },

    unreadMessages: {
      type: Number,
      default: 0,
    },

    // ─── Cart & Favorites (advertiser only) ───────────────
    cartCount: {
      type: Number,
      default: 0,
    },

    favoritesCount: {
      type: Number,
      default: 0,
    },

    // ─── Membership ───────────────────────────────────────
    membershipTier: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('User', userSchema);