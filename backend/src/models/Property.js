const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['flat', 'tenement', 'villa', 'studio', 'duplex', 'penthouse', 'bungalow', 'farmhouse', 'commercial', 'pg'],
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'unavailable'],
      default: 'available',
    },
    rent: {
      amount: { type: Number, required: true, min: 0 },
      type: { type: String, enum: ['monthly', 'per-day'], default: 'monthly' },
      isNegotiable: { type: Boolean, default: false },
      deposit: { type: Number, default: 0 },
    },
    area: {
      size: { type: Number },
      unit: { type: String, enum: ['sqft', 'sqm', 'bhk'], default: 'sqft' },
    },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'unfurnished',
    },
    tenantType: {
      type: String,
      enum: ['any', 'family', 'bachelor'],
      default: 'any',
    },
    occupancy: {
      type: String,
      enum: ['any', 'boys', 'girls', 'coed'],
      default: 'any',
    },
    isVerified: { type: Boolean, default: false },

    amenities: [
      {
        type: String,
        enum: [
          'gym', 'swimming-pool', 'parking', 'lift', 'security', 'cctv',
          'power-backup', 'wifi', 'ac', 'gas-pipeline', 'intercom',
          'club-house', 'garden', 'kids-play-area', 'jogging-track',
          'laundry', 'meals-included',
        ],
      },
    ],

    nearbyFacilities: [
      {
        name: { type: String },
        type: {
          type: String,
          enum: ['hospital', 'school', 'college', 'gym', 'bar', 'restaurant',
            'market', 'pharmacy', 'bank', 'atm', 'bus-stop', 'metro', 'mall', 'park'],
        },
        distance: { type: Number },
        unit: { type: String, enum: ['m', 'km'], default: 'km' },
      },
    ],

    images: [imageSchema],

    location: {
      address: { type: String, required: true },
      locality: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
          validate: {
            validator: (v) => v.length === 2,
            message: 'Coordinates must be [longitude, latitude]',
          },
        },
      },
    },

    contact: {
      whatsapp: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    impressions: {
      views: { type: Number, default: 0 },
      listings: { type: Number, default: 0 },
    },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    availableFrom: { type: Date, default: Date.now },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
// Geospatial index (2dsphere) for location-based search
propertySchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for common query patterns
propertySchema.index({ broker: 1, isActive: 1 });
propertySchema.index({ propertyType: 1, status: 1, isActive: 1 });
propertySchema.index({ 'rent.amount': 1, 'rent.type': 1 });
propertySchema.index({ 'location.city': 1, 'location.locality': 1 });
propertySchema.index({ amenities: 1 });
propertySchema.index({ tenantType: 1 });
propertySchema.index({ isFeatured: 1, isActive: 1 });
propertySchema.index({ createdAt: -1 });

// Text index for full-text search
propertySchema.index(
  { title: 'text', description: 'text', 'location.address': 'text', 'location.locality': 'text', tags: 'text' },
  { weights: { title: 10, 'location.locality': 8, tags: 6, description: 2 } }
);

// Virtual: inquiries count
propertySchema.virtual('inquiriesCount', {
  ref: 'Inquiry',
  localField: '_id',
  foreignField: 'property',
  count: true,
});

module.exports = mongoose.model('Property', propertySchema);
