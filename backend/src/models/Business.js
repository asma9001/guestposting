const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    // ✅ RELATIONSHIP
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },

    // ✅ COMPANY INFORMATION
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    regNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },
    vatNumber: {
      type: String,
      required: [true, "VAT number is required"],
      trim: true,
    },

    // ✅ ADDRESS
    address: {
      type: String,
      required: [true, "Business address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },

    // ✅ VERIFICATION STATUS
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "suspended"],
      default: "pending",
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // ✅ DOCUMENT UPLOAD
    documentUrl: {
      type: String,
      default: null,
    },
    documentVerificationDate: {
      type: Date,
      default: null,
    },

    // ✅ TIMESTAMPS
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("Business", businessSchema);
