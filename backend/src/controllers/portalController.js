const Website = require("../models/Website.js");

const createWebsite = async (req, res) => {
  try {
    const {
      websiteUrl,
      verificationStatus,
      verificationMethod,
      description,
      instructions,
      countries,
      language,
      categories,
      sensitiveTopics,
      maxLinks,
      imagesPerPost,
      linkType,
      sponsorshipNotification,
      publishOnHome,
      publishInCategories,
      priceNormal,
      priceSensitive,
      priceCopywriting,
      enableCopywriting,
      discount,
    } = req.body;

    const website = await Website.create({
      userId: req.user?.id,
      websiteUrl,
      verificationStatus: verificationStatus || "pending",
      verificationMethod,
      description,
      instructions,
      countries,
      language,
      categories,
      sensitiveTopics,
      maxLinks,
      imagesPerPost,
      linkType,
      sponsorshipNotification,
      publishOnHome,
      publishInCategories,
      priceNormal,
      priceSensitive,
      priceCopywriting,
      enableCopywriting,
      discount,
      status: "pending_review",
    });

    res.status(201).json({
      success: true,
      message: "Website created successfully",
      website,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// GET /api/websites
const getWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: websites.length,
      websites,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/websites/:id/stats
const getWebsiteStats = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { websiteId: req.params.id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalEarnings: { $sum: "$price" }
        }
      }
    ]);

    const stats = {
      inProgress: 0,
      published: 0,
      requests: 0,
      totalEarnings: 0,
      clearedEarnings: 0,
      pendingEarnings: 0,
    };

    orders.forEach(order => {
      if (order._id === "in_progress") stats.inProgress = order.count;
      if (order._id === "published") {
        stats.published = order.count;
        stats.totalEarnings += order.totalEarnings;
      }
      if (order._id === "pending") stats.requests = order.count;
    });

    res.status(200).json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/dashboard
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id;

    const [websites, earnings, recentOrders] = await Promise.all([
      Website.find({ userId }),

      Earning.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$status",
            total: { $sum: "$amount" }
          }
        }
      ]),

      Order.find({ sellerId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("websiteId", "websiteUrl"),
    ]);

    const earningsSummary = {
      cleared: 0,
      pending: 0,
    };
    earnings.forEach(e => {
      if (e._id === "cleared") earningsSummary.cleared = e.total;
      if (e._id === "pending") earningsSummary.pending = e.total;
    });
    earningsSummary.total = earningsSummary.cleared + earningsSummary.pending;

    res.status(200).json({
      success: true,
      data: {
        websites,
        earnings: earningsSummary,
        recentOrders,
        totalWebsites: websites.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const updateWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      userId: req.user?.id, // ensure user owns this website
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const updatedWebsite = await Website.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        status: "pending_review", // re-review after update (optional)
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Website updated successfully",
      website: updatedWebsite,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id, // सुरक्षा: only owner can delete
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Website deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// GET /api/websites/:id
const getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      // Security: Ensure user owns this website
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      website,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = { createWebsite,getWebsites,getWebsiteStats,getDashboardData,updateWebsite,deleteWebsite,getWebsiteById };