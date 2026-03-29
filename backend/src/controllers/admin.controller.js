const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/admin/brokers — Create broker
const createBroker = asyncHandler(async (req, res) => {
  const { name, email, password, phone, whatsapp } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'A user with this email already exists.');

  const broker = await User.create({
    name, email, password, phone, whatsapp,
    role: 'broker',
    createdBy: req.user._id,
  });

  broker.password = undefined;
  res.status(201).json(new ApiResponse(201, { broker }, 'Broker created successfully'));
});

// GET /api/admin/brokers — List all brokers
const getBrokers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  const skip = (page - 1) * limit;

  const query = { role: 'broker' };
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const [brokers, total] = await Promise.all([
    User.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // Attach property count per broker
  const brokerIds = brokers.map((b) => b._id);
  const propertyCounts = await Property.aggregate([
    { $match: { broker: { $in: brokerIds }, isActive: true } },
    { $group: { _id: '$broker', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(propertyCounts.map((p) => [p._id.toString(), p.count]));
  const brokersWithCount = brokers.map((b) => ({ ...b, propertyCount: countMap[b._id.toString()] || 0 }));

  res.status(200).json(
    new ApiResponse(200, { brokers: brokersWithCount }, 'Brokers fetched', {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    })
  );
});

// GET /api/admin/brokers/:id — Single broker
const getBroker = asyncHandler(async (req, res) => {
  const broker = await User.findOne({ _id: req.params.id, role: 'broker' })
    .populate('createdBy', 'name email')
    .lean();
  if (!broker) throw new ApiError(404, 'Broker not found.');
  res.status(200).json(new ApiResponse(200, { broker }, 'Broker fetched'));
});

// PATCH /api/admin/brokers/:id — Update broker
const updateBroker = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'whatsapp', 'isActive'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const broker = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'broker' },
    updates,
    { new: true, runValidators: true }
  );
  if (!broker) throw new ApiError(404, 'Broker not found.');
  res.status(200).json(new ApiResponse(200, { broker }, 'Broker updated'));
});

// DELETE /api/admin/brokers/:id — Delete broker
const deleteBroker = asyncHandler(async (req, res) => {
  const broker = await User.findOneAndDelete({ _id: req.params.id, role: 'broker' });
  if (!broker) throw new ApiError(404, 'Broker not found.');
  // Mark all their properties as inactive
  await Property.updateMany({ broker: req.params.id }, { isActive: false });
  res.status(200).json(new ApiResponse(200, null, 'Broker deleted'));
});

// GET /api/admin/analytics — System-wide analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalBrokers,
    activeBrokers,
    totalProperties,
    availableProperties,
    totalInquiries,
    propertyTypeStats,
    topBrokers,
    recentInquiries,
  ] = await Promise.all([
    User.countDocuments({ role: 'broker' }),
    User.countDocuments({ role: 'broker', isActive: true }),
    Property.countDocuments({ isActive: true }),
    Property.countDocuments({ status: 'available', isActive: true }),
    Inquiry.countDocuments(),
    Property.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Property.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$broker', totalViews: { $sum: '$impressions.views' }, propertyCount: { $sum: 1 } } },
      { $sort: { totalViews: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'broker' } },
      { $unwind: '$broker' },
      { $project: { 'broker.password': 0 } },
    ]),
    Inquiry.find().populate('property', 'title').populate('broker', 'name').sort('-createdAt').limit(10).lean(),
  ]);

  const totalImpressions = await Property.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, views: { $sum: '$impressions.views' }, listings: { $sum: '$impressions.listings' } } },
  ]);

  res.status(200).json(new ApiResponse(200, {
    overview: {
      totalBrokers, activeBrokers, totalProperties, availableProperties, totalInquiries,
      totalViews: totalImpressions[0]?.views || 0,
      totalListings: totalImpressions[0]?.listings || 0,
    },
    propertyTypeStats,
    topBrokers,
    recentInquiries,
  }, 'Analytics fetched'));
});

module.exports = { createBroker, getBrokers, getBroker, updateBroker, deleteBroker, getAnalytics };
