const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { loginSchema, updateProfileSchema, changePasswordSchema } = require('../validators/auth.validator');

router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.patch('/update-profile', protect, validate(updateProfileSchema), updateProfile);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
