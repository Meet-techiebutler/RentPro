const express = require('express');
const router = express.Router();
const { getDashboard, getMyProperties } = require('../controllers/broker.controller');
const { getBrokerInquiries, updateInquiryStatus } = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect, restrictTo('broker', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/properties', getMyProperties);
router.get('/inquiries', getBrokerInquiries);
router.patch('/inquiries/:id/status', updateInquiryStatus);

module.exports = router;
