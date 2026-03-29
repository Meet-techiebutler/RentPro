const Property = require('../models/Property');
const { getCache, setCache, deleteCachePattern } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

const buildSearchQuery = (filters) => {
  const query = { isActive: true };

  if (filters.status) query.status = filters.status;
  if (filters.propertyType) query.propertyType = { $in: filters.propertyType.split(',') };
  if (filters.furnishing) query.furnishing = { $in: filters.furnishing.split(',') };
  if (filters.bedrooms) query.bedrooms = { $gte: Number(filters.bedrooms) };
  if (filters.bathrooms) query.bathrooms = { $gte: Number(filters.bathrooms) };

  if (filters.minRent || filters.maxRent) {
    query['rent.amount'] = {};
    if (filters.minRent) query['rent.amount'].$gte = Number(filters.minRent);
    if (filters.maxRent) query['rent.amount'].$lte = Number(filters.maxRent);
  }

  if (filters.rentType) query['rent.type'] = filters.rentType;

  if (filters.amenities) {
    const amenityList = filters.amenities.split(',').map((a) => a.trim());
    query.amenities = { $all: amenityList };
  }

  if (filters.tenantType && filters.tenantType !== 'all') {
    query.tenantType = { $in: [filters.tenantType, 'any'] };
  }

  if (filters.occupancy && filters.occupancy !== 'all') {
    query.occupancy = { $in: [filters.occupancy, 'any'] };
  }

  if (filters.isVerified === 'true' || filters.isVerified === true) {
    query.isVerified = true;
  }

  if (filters.mealsIncluded === 'true') {
    query.amenities = { ...(query.amenities || {}), $all: [...(query.amenities?.$all || []), 'meals-included'] };
  }

  if (filters.availableNow === 'true') {
    query.availableFrom = { $lte: new Date() };
  }

  if (filters.city) query['location.city'] = { $regex: filters.city, $options: 'i' };
  if (filters.locality) query['location.locality'] = { $regex: filters.locality, $options: 'i' };
  if (filters.broker) query.broker = filters.broker;

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return query;
};

const buildGeoQuery = (lat, lng, radiusKm = 10) => ({
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      $maxDistance: radiusKm * 1000, // meters
    },
  },
});

const searchProperties = async (filters, options = {}) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  const cacheKey = `properties:search:${JSON.stringify({ filters, options })}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  let query = buildSearchQuery(filters);

  // Geospatial search takes precedence over text search for location
  if (filters.lat && filters.lng) {
    const geoQuery = buildGeoQuery(filters.lat, filters.lng, filters.radius || 10);
    query = { ...query, ...geoQuery };
  }

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate('broker', 'name email phone whatsapp avatar')
      .sort(filters.search && !filters.lat ? { score: { $meta: 'textScore' }, ...parseSortString(sort) } : parseSortString(sort))
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Property.countDocuments(query),
  ]);

  const result = {
    properties,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
};

const parseSortString = (sort) => {
  const sortObj = {};
  const parts = sort.split(',');
  for (const part of parts) {
    if (part.startsWith('-')) sortObj[part.slice(1)] = -1;
    else sortObj[part] = 1;
  }
  return sortObj;
};

const invalidatePropertyCache = async () => {
  await deleteCachePattern('properties:*');
};

module.exports = { searchProperties, buildSearchQuery, buildGeoQuery, invalidatePropertyCache };
