const Joi = require('joi');

const inquirySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow(''),
  phone: Joi.string().allow(''),
  message: Joi.string().min(10).max(1000).required(),
  channel: Joi.string().valid('form','whatsapp','email','phone').default('form'),
});

module.exports = { inquirySchema };
