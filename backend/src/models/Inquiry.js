const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 1000,
    },
    channel: {
      type: String,
      enum: ['form', 'whatsapp', 'email', 'phone'],
      default: 'form',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Indexes
inquirySchema.index({ property: 1, createdAt: -1 });
inquirySchema.index({ broker: 1, status: 1 });
inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
