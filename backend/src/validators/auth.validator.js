const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const createBrokerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().allow(''),
  whatsapp: Joi.string().allow(''),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow(''),
  whatsapp: Joi.string().allow(''),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

module.exports = { loginSchema, createBrokerSchema, updateProfileSchema, changePasswordSchema };
