const express = require('express');
const router = express.Router();
const { createBroker, getBrokers, getBroker, updateBroker, deleteBroker, getAnalytics } = require('../controllers/admin.controller');
const { getAllInquiries } = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createBrokerSchema } = require('../validators/auth.validator');

router.use(protect, restrictTo('admin'));

router.get('/analytics', getAnalytics);
router.get('/inquiries', getAllInquiries);

router.route('/brokers')
  .get(getBrokers)
  .post(validate(createBrokerSchema), createBroker);

router.route('/brokers/:id')
  .get(getBroker)
  .patch(updateBroker)
  .delete(deleteBroker);

module.exports = router;
