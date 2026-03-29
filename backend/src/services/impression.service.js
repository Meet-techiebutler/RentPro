const Property = require('../models/Property');
const ImpressionLog = require('../models/ImpressionLog');

// In-memory buffer: { propertyId: { views: N, listings: N } }
// Flushed to DB every 60 seconds to avoid write amplification
const buffer = new Map();
let flushInterval = null;

const getToday = () => new Date().toISOString().slice(0, 10);

const recordView = (propertyId) => {
  const key = propertyId.toString();
  const entry = buffer.get(key) || { views: 0, listings: 0 };
  entry.views += 1;
  buffer.set(key, entry);
};

const recordListing = (propertyIds) => {
  for (const id of propertyIds) {
    const key = id.toString();
    const entry = buffer.get(key) || { views: 0, listings: 0 };
    entry.listings += 1;
    buffer.set(key, entry);
  }
};

const flush = async () => {
  if (buffer.size === 0) return;

  const today = getToday();
  const snapshot = new Map(buffer);
  buffer.clear();

  const ops = [];
  for (const [propertyId, counts] of snapshot.entries()) {
    // Upsert daily log
    ops.push(
      ImpressionLog.findOneAndUpdate(
        { property: propertyId, date: today },
        { $inc: { views: counts.views, listings: counts.listings } },
        { upsert: true }
      )
    );

    // Increment denormalized counts on Property for fast dashboard reads
    ops.push(
      Property.findByIdAndUpdate(propertyId, {
        $inc: {
          'impressions.views': counts.views,
          'impressions.listings': counts.listings,
        },
      })
    );
  }

  try {
    await Promise.allSettled(ops);
  } catch (err) {
    console.error('Impression flush error:', err.message);
  }
};

const startFlushScheduler = () => {
  if (flushInterval) return;
  flushInterval = setInterval(flush, 60_000); // flush every 60s
};

const stopFlushScheduler = async () => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
  await flush(); // drain remaining buffer on shutdown
};

// Get impression stats for a broker's properties
const getBrokerImpressionStats = async (brokerId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const properties = await Property.find({ broker: brokerId, isActive: true }, '_id');
  const propertyIds = properties.map((p) => p._id);

  const logs = await ImpressionLog.aggregate([
    {
      $match: {
        property: { $in: propertyIds },
        date: { $gte: sinceStr },
      },
    },
    {
      $group: {
        _id: '$date',
        totalViews: { $sum: '$views' },
        totalListings: { $sum: '$listings' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return logs;
};

module.exports = { recordView, recordListing, flush, startFlushScheduler, stopFlushScheduler, getBrokerImpressionStats };
