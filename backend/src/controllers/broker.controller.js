const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getBrokerImpressionStats } = require('../services/impression.service');

// GET /api/broker/dashboard — Broker dashboard stats
const getDashboard = asyncHandler(async (req, res) => {
  const brokerId = req.user._id;

  const [
    totalProperties,
    availableProperties,
    rentedProperties,
    totalInquiries,
    newInquiries,
    impressionAggr,
    recentProperties,
    recentInquiries,
  ] = await Promise.all([
    Property.countDocuments({ broker: brokerId, isActive: true }),
    Property.countDocuments({ broker: brokerId, isActive: true, status: 'available' }),
    Property.countDocuments({ broker: brokerId, isActive: true, status: 'rented' }),
    Inquiry.countDocuments({ broker: brokerId }),
    Inquiry.countDocuments({ broker: brokerId, status: 'new' }),
    Property.aggregate([
      { $match: { broker: brokerId, isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$impressions.views' }, totalListings: { $sum: '$impressions.listings' } } },
    ]),
    Property.find({ broker: brokerId, isActive: true })
      .sort('-createdAt')
      .limit(5)
      .lean(),
    Inquiry.find({ broker: brokerId })
      .populate('property', 'title images')
      .sort('-createdAt')
      .limit(5)
      .lean(),
  ]);

  const impressionTrend = await getBrokerImpressionStats(brokerId, 30);

  res.status(200).json(new ApiResponse(200, {
    stats: {
      totalProperties,
      availableProperties,
      rentedProperties,
      totalInquiries,
      newInquiries,
      totalViews: impressionAggr[0]?.totalViews || 0,
      totalListings: impressionAggr[0]?.totalListings || 0,
    },
    recentProperties,
    recentInquiries,
    impressionTrend,
  }, 'Dashboard fetched'));
});

// GET /api/broker/properties — Broker's own properties
const getMyProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status, sort = '-createdAt' } = req.query;
  const skip = (page - 1) * limit;

  const query = { broker: req.user._id, isActive: true };
  if (status) query.status = status;

  const [properties, total] = await Promise.all([
    Property.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Property.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, { properties }, 'Properties fetched', {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    })
  );
});

module.exports = { getDashboard, getMyProperties };
