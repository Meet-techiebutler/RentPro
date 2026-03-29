const express = require('express');
const router = express.Router();
const {
  getProperties, getFeaturedProperties, getNearbyProperties,
  getProperty, createProperty, updateProperty, deleteProperty, deletePropertyImage,
} = require('../controllers/property.controller');
const { createInquiry } = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { inquirySchema } = require('../validators/inquiry.validator');
const { upload } = require('../config/upload');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/nearby', getNearbyProperties);
router.get('/:id', getProperty);
router.post('/:id/inquiries', validate(inquirySchema), createInquiry);

// Broker / Admin protected routes
router.post(
  '/',
  protect, restrictTo('broker', 'admin'),
  upload.array('images', 10),
  createProperty
);
router.patch(
  '/:id',
  protect, restrictTo('broker', 'admin'),
  upload.array('images', 10),
  updateProperty
);
router.delete('/:id', protect, restrictTo('broker', 'admin'), deleteProperty);
router.delete('/:id/images/:publicId', protect, restrictTo('broker', 'admin'), deletePropertyImage);

module.exports = router;
