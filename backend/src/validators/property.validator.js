const Joi = require('joi');

const nearbyFacilitySchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('hospital','school','college','gym','bar','restaurant','market',
    'pharmacy','bank','atm','bus-stop','metro','mall','park').required(),
  distance: Joi.number().min(0),
  unit: Joi.string().valid('m','km').default('km'),
});

const propertySchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  propertyType: Joi.string().valid('flat','tenement','villa','studio','duplex',
    'penthouse','bungalow','farmhouse','commercial','pg').required(),
  status: Joi.string().valid('available','rented','unavailable').default('available'),
  rent: Joi.object({
    amount: Joi.number().min(0).required(),
    type: Joi.string().valid('monthly','per-day').default('monthly'),
    isNegotiable: Joi.boolean().default(false),
    deposit: Joi.number().min(0).default(0),
  }).required(),
  area: Joi.object({
    size: Joi.number().min(0),
    unit: Joi.string().valid('sqft','sqm','bhk').default('sqft'),
  }),
  bedrooms: Joi.number().min(0).max(20),
  bathrooms: Joi.number().min(0).max(20),
  furnishing: Joi.string().valid('unfurnished','semi-furnished','fully-furnished'),
  tenantType: Joi.string().valid('any','family','bachelor').default('any'),
  occupancy: Joi.string().valid('any','boys','girls','coed').default('any'),
  isVerified: Joi.boolean().default(false),
  amenities: Joi.array().items(Joi.string().valid(
    'gym','swimming-pool','parking','lift','security','cctv','power-backup',
    'wifi','ac','gas-pipeline','intercom','club-house','garden','kids-play-area','jogging-track',
    'laundry','meals-included'
  )),
  nearbyFacilities: Joi.array().items(nearbyFacilitySchema),
  location: Joi.object({
    address: Joi.string().required(),
    locality: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().allow(''),
    coordinates: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }).required(),
  }).required(),
  contact: Joi.object({
    whatsapp: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    phone: Joi.string().allow(''),
  }),
  availableFrom: Joi.date(),
  tags: Joi.array().items(Joi.string().max(50)),
  isFeatured: Joi.boolean(),
});

const updatePropertySchema = propertySchema.fork(
  ['title','description','propertyType','rent','location'],
  (schema) => schema.optional()
);

module.exports = { propertySchema, updatePropertySchema };
