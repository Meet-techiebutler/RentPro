const mongoose = require('mongoose');

// Stores aggregated daily impression data to avoid per-request writes on Property doc
const impressionLogSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD for easy daily grouping
      required: true,
    },
    views: { type: Number, default: 0 },
    listings: { type: Number, default: 0 },
  },
  { timestamps: false }
);

// Unique compound index: one doc per property per day
impressionLogSchema.index({ property: 1, date: 1 }, { unique: true });
impressionLogSchema.index({ date: 1 });

module.exports = mongoose.model('ImpressionLog', impressionLogSchema);
