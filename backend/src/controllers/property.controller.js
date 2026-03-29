const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { searchProperties, invalidatePropertyCache } = require('../services/property.service');
const { recordView, recordListing } = require('../services/impression.service');
const { deleteLocalImage } = require('../config/upload');

// GET /api/properties — Public search + filter
const getProperties = asyncHandler(async (req, res) => {
  const result = await searchProperties(req.query, {
    page: req.query.page || 1,
    limit: req.query.limit || 12,
    sort: req.query.sort || '-createdAt',
  });

  if (result.properties.length > 0) {
    recordListing(result.properties.map((p) => p._id));
  }

  res.status(200).json(new ApiResponse(200, result, 'Properties fetched', result.pagination));
});

// GET /api/properties/featured — Featured listings
const getFeaturedProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ isFeatured: true, isActive: true, status: 'available' })
    .populate('broker', 'name phone whatsapp avatar')
    .sort('-createdAt')
    .limit(8)
    .lean();

  res.status(200).json(new ApiResponse(200, { properties }, 'Featured properties fetched'));
});

// GET /api/properties/nearby — Geospatial nearby search
const getNearbyProperties = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5, limit = 10 } = req.query;
  if (!lat || !lng) throw new ApiError(400, 'Latitude and longitude are required.');

  const properties = await Property.find({
    isActive: true,
    status: 'available',
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000,
      },
    },
  })
    .populate('broker', 'name phone whatsapp avatar')
    .limit(Number(limit))
    .lean();

  res.status(200).json(new ApiResponse(200, { properties }, 'Nearby properties fetched'));
});

// GET /api/properties/:id — Single property (public)
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isActive: true })
    .populate('broker', 'name email phone whatsapp avatar')
    .lean();

  if (!property) throw new ApiError(404, 'Property not found.');

  // Non-blocking impression record
  recordView(property._id);

  res.status(200).json(new ApiResponse(200, { property }, 'Property fetched'));
});

// POST /api/properties — Broker creates property
const createProperty = asyncHandler(async (req, res) => {
  // Parse JSON fields that may come as strings from multipart form
  let body = req.body;
  if (typeof body.rent === 'string') body.rent = JSON.parse(body.rent);
  if (typeof body.location === 'string') body.location = JSON.parse(body.location);
  if (typeof body.area === 'string') body.area = JSON.parse(body.area);
  if (typeof body.amenities === 'string') body.amenities = JSON.parse(body.amenities);
  if (typeof body.nearbyFacilities === 'string') body.nearbyFacilities = JSON.parse(body.nearbyFacilities);
  if (typeof body.contact === 'string') body.contact = JSON.parse(body.contact);
  if (typeof body.tags === 'string') body.tags = JSON.parse(body.tags);

  // Build images array from uploaded files (local storage)
  const images = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, idx) => {
      images.push({
        url: `/uploads/properties/${file.filename}`,
        publicId: file.filename,
        isPrimary: idx === 0,
      });
    });
  }

  // Fallback contact from broker profile
  if (!body.contact) {
    body.contact = {
      whatsapp: req.user.whatsapp,
      email: req.user.email,
      phone: req.user.phone,
    };
  }

  const property = await Property.create({
    ...body,
    images,
    broker: req.user._id,
  });

  await invalidatePropertyCache();

  const populated = await property.populate('broker', 'name email phone whatsapp avatar');
  res.status(201).json(new ApiResponse(201, { property: populated }, 'Property created successfully'));
});

// PATCH /api/properties/:id — Broker updates property
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isActive: true });
  if (!property) throw new ApiError(404, 'Property not found.');

  // Only owning broker or admin can update
  if (property.broker.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this property.');
  }

  let body = req.body;
  if (typeof body.rent === 'string') body.rent = JSON.parse(body.rent);
  if (typeof body.location === 'string') body.location = JSON.parse(body.location);
  if (typeof body.area === 'string') body.area = JSON.parse(body.area);
  if (typeof body.amenities === 'string') body.amenities = JSON.parse(body.amenities);
  if (typeof body.nearbyFacilities === 'string') body.nearbyFacilities = JSON.parse(body.nearbyFacilities);
  if (typeof body.contact === 'string') body.contact = JSON.parse(body.contact);
  if (typeof body.tags === 'string') body.tags = JSON.parse(body.tags);

  // Append new images (local storage)
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, idx) => ({
      url: `/uploads/properties/${file.filename}`,
      publicId: file.filename,
      isPrimary: property.images.length === 0 && idx === 0,
    }));
    body.images = [...property.images, ...newImages];
  }

  Object.assign(property, body);
  await property.save();

  await invalidatePropertyCache();

  res.status(200).json(new ApiResponse(200, { property }, 'Property updated'));
});

// DELETE /api/properties/:id — Broker deletes property
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isActive: true });
  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.broker.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this property.');
  }

  // Delete local image files
  if (property.images.length > 0) {
    property.images.forEach((img) => deleteLocalImage(img.url));
  }

  property.isActive = false;
  await property.save();

  await invalidatePropertyCache();

  res.status(200).json(new ApiResponse(200, null, 'Property deleted'));
});

// DELETE /api/properties/:id/images/:publicId — Remove single image
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isActive: true });
  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.broker.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized.');
  }

  const publicId = decodeURIComponent(req.params.publicId);
  const imageIdx = property.images.findIndex((img) => img.publicId === publicId);
  if (imageIdx === -1) throw new ApiError(404, 'Image not found.');

  deleteLocalImage(property.images[imageIdx].url);
  property.images.splice(imageIdx, 1);

  // If primary was removed, set next as primary
  if (property.images.length > 0 && !property.images.some((i) => i.isPrimary)) {
    property.images[0].isPrimary = true;
  }

  await property.save();
  res.status(200).json(new ApiResponse(200, { images: property.images }, 'Image deleted'));
});

module.exports = {
  getProperties, getFeaturedProperties, getNearbyProperties,
  getProperty, createProperty, updateProperty, deleteProperty, deletePropertyImage,
};
