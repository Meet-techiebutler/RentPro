const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { emitNewInquiry } = require('../socket');

// POST /api/properties/:id/inquiries — Public: submit inquiry
const createInquiry = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isActive: true });
  if (!property) throw new ApiError(404, 'Property not found.');

  const inquiry = await Inquiry.create({
    ...req.body,
    property: property._id,
    broker: property.broker,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Live push to broker + admin via Socket.IO
  emitNewInquiry(property.broker, {
    _id: inquiry._id,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    message: inquiry.message,
    channel: inquiry.channel,
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    property: { _id: property._id, title: property.title },
  });

  res.status(201).json(new ApiResponse(201, { inquiry }, 'Inquiry submitted successfully'));
});

// GET /api/broker/inquiries — Broker: get own inquiries
const getBrokerInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, propertyId } = req.query;
  const skip = (page - 1) * limit;

  const query = { broker: req.user._id };
  if (status) query.status = status;
  if (propertyId) query.property = propertyId;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(query)
      .populate('property', 'title location.city images')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Inquiry.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, { inquiries }, 'Inquiries fetched', {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    })
  );
});

// PATCH /api/broker/inquiries/:id — Broker: update inquiry status
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status)) {
    throw new ApiError(400, 'Invalid status value.');
  }

  const inquiry = await Inquiry.findOneAndUpdate(
    { _id: req.params.id, broker: req.user._id },
    { status },
    { new: true }
  );
  if (!inquiry) throw new ApiError(404, 'Inquiry not found.');

  res.status(200).json(new ApiResponse(200, { inquiry }, 'Inquiry status updated'));
});

// GET /api/admin/inquiries — Admin: all inquiries
const getAllInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(query)
      .populate('property', 'title location.city')
      .populate('broker', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Inquiry.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, { inquiries }, 'All inquiries fetched', {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    })
  );
});

module.exports = { createInquiry, getBrokerInquiries, updateInquiryStatus, getAllInquiries };
