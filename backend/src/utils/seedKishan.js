/**
 * Seed script — creates broker kishankhunt508@gmail.com + 20 demo properties
 * with 60 days of impression history for demo/judging purposes.
 *
 * Usage (from backend/ directory):
 *   node src/utils/seedKishan.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Property = require('../models/Property');
const ImpressionLog = require('../models/ImpressionLog');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://meet:6aUuNwFBWnvh4YaN@trading.3qot1y3.mongodb.net/rentpro_db?retryWrites=true&w=majority&appName=Tradings';

// ─── Rajkot coordinates spread ──────────────────────────────────────────────
const LOCALITIES = [
  { name: 'Kalawad Road',     coords: [70.7415, 22.3143] },
  { name: 'University Road',  coords: [70.7945, 22.2945] },
  { name: '150 Ft Ring Road', coords: [70.7753, 22.2872] },
  { name: 'Mavdi',            coords: [70.7620, 22.2935] },
  { name: 'Gondal Road',      coords: [70.7891, 22.2643] },
  { name: 'Bhaktinagar',      coords: [70.8012, 22.3012] },
  { name: 'Raiya Road',       coords: [70.7534, 22.3201] },
  { name: 'Kothariya',        coords: [70.7312, 22.2756] },
  { name: 'Yagnik Road',      coords: [70.8143, 22.3145] },
  { name: 'Rajkot Airport Area', coords: [70.7795, 22.3089] },
];

// Royalty-free placeholder images (Unsplash direct CDN — no API key needed)
const IMAGE_SETS = [
  ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
  ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
  ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
  ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80','https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80'],
  ['https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&q=80','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'],
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80','https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800&q=80'],
  ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
  ['https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80','https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80'],
  ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80','https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80'],
];

const PROPERTY_TYPES = ['flat','flat','flat','tenement','villa','studio','duplex','pg','bungalow','flat','tenement','flat','studio','flat','villa','pg','duplex','flat','bungalow','flat'];
const FURNISHINGS  = ['unfurnished','semi-furnished','fully-furnished','semi-furnished','fully-furnished','unfurnished','semi-furnished','fully-furnished','unfurnished','fully-furnished','semi-furnished','unfurnished','fully-furnished','semi-furnished','unfurnished','fully-furnished','semi-furnished','unfurnished','fully-furnished','semi-furnished'];
const TENANTS      = ['any','family','bachelor','any','family','any','bachelor','any','family','bachelor','any','family','any','bachelor','any','family','bachelor','any','family','any'];
const OCCUPANCY    = ['any','coed','boys','girls','any','boys','coed','any','girls','boys','any','coed','any','boys','girls','any','coed','any','boys','coed'];
const STATUSES     = ['available','available','available','available','rented','available','available','available','rented','available','available','available','available','rented','available','available','available','available','rented','available'];

const TITLES = [
  '2BHK Flat Near Kalawad Road',
  'Modern Studio with City View',
  'Spacious 3BHK Semi-Furnished Flat',
  'Budget Tenement for Family',
  'Luxurious Villa with Garden',
  'Compact Studio Near University',
  'Duplex on 150 Ft Ring Road',
  'PG for Working Professionals',
  'Independent Bungalow in Mavdi',
  'Well-Ventilated 1BHK Flat',
  'Fully Furnished 2BHK Tenement',
  'Affordable 1BHK near Airport',
  'Premium Studio with AC',
  '3BHK Flat with Parking',
  'Villa with Swimming Pool Access',
  'Boys PG Near College',
  'Elegant Duplex in Bhaktinagar',
  'Cozy 2BHK Flat in Raiya Road',
  'Spacious Bungalow with Terrace',
  '1BHK Fully Furnished Flat',
];

const DESCRIPTIONS = [
  'Well-maintained flat with all modern amenities. Close to schools, hospitals, and shopping centers. 24/7 water supply and power backup available.',
  'Perfect for single professionals and students. Modern interiors with fully equipped kitchen. Walking distance to IT parks.',
  'Ideal for a growing family. Spacious rooms with cross-ventilation. Society with security and CCTV surveillance.',
  'Economical option for small families. Ground floor tenement with private entrance. Easy access to public transport.',
  'Elegant villa with private garden and covered parking. Premium construction quality. Gated community with amenities.',
  'Compact and comfortable studio for students and working individuals. Attached bathroom, kitchenette, and fast WiFi.',
  'Duplex unit with double-height ceilings and stylish interiors. Located in a prime commercial and residential zone.',
  'Safe and clean PG accommodation with homely meals available. Common areas include TV lounge and laundry zone.',
  'Standalone bungalow with ample outdoor space. Perfect for large families. Multiple parking spots, storage rooms.',
  'Bright and airy flat with tiled flooring and modern fixtures. Quiet neighborhood with good road connectivity.',
  'Move-in ready tenement with all furniture included. Walking distance to markets, pharmacies, and schools.',
  'Affordable flat suitable for nuclear families. Close to airport and major highways. Good rental value.',
  'Premium studio with split AC, modular kitchen, and furnished interiors. Ideal for corporate professionals.',
  'Spacious 3BHK with dedicated parking. Wide balcony with open views. Residential society with gym and playground.',
  'Exclusive villa offering pool access and clubhouse privileges. Ultra-premium finishes throughout.',
  'Hygienic PG for male students near university campus. Attached washrooms, study tables, WiFi included.',
  'Beautifully designed duplex with open floor plan. Prime location on main road with excellent connectivity.',
  'Comfortable family flat with ample storage and modern kitchen. Close to top-rated schools and hospitals.',
  'Large bungalow ideal for joint families. Garden, covered parking, terrace access, and spacious interiors.',
  'Ready-to-move 1BHK with AC and furnished essentials. Perfect for working professionals seeking quick relocation.',
];

const RENTS = [14000,8500,22000,7000,45000,9500,25000,6000,35000,11000,18000,10500,13000,21000,55000,5500,28000,13500,40000,12000];
const DEPOSITS = [28000,17000,44000,14000,90000,19000,50000,0,70000,22000,36000,21000,26000,42000,110000,0,56000,27000,80000,24000];
const BEDROOMS  = [2,0,3,1,4,0,3,0,4,1,2,1,0,3,5,0,3,2,4,1];
const BATHROOMS = [1,1,2,1,3,1,2,1,3,1,2,1,1,2,4,1,2,2,3,1];
const AREAS     = [850,380,1400,550,2800,420,1600,200,3200,650,950,620,400,1300,3800,180,1750,800,2900,580];

function pickLocality(i) {
  return LOCALITIES[i % LOCALITIES.length];
}

function makeProperty(i, brokerId) {
  const loc = pickLocality(i);
  const imgSet = IMAGE_SETS[i % IMAGE_SETS.length];
  const isRentTypePerDay = i === 7 || i === 15; // PG entries

  return {
    title: TITLES[i],
    description: DESCRIPTIONS[i],
    propertyType: PROPERTY_TYPES[i],
    status: STATUSES[i],
    rent: {
      amount: RENTS[i],
      type: isRentTypePerDay ? 'per-day' : 'monthly',
      isNegotiable: i % 3 === 0,
      deposit: DEPOSITS[i],
    },
    area: { size: AREAS[i], unit: 'sqft' },
    bedrooms: BEDROOMS[i],
    bathrooms: BATHROOMS[i],
    furnishing: FURNISHINGS[i],
    tenantType: TENANTS[i],
    occupancy: OCCUPANCY[i],
    amenities: (['parking','wifi','security','lift','power-backup','cctv','ac','gym','swimming-pool','gas-pipeline']).slice(0, 3 + (i % 7)),
    nearbyFacilities: [
      { name: 'City Hospital', type: 'hospital', distance: (1 + i % 4).toString(), unit: 'km' },
      { name: 'Local Market', type: 'market', distance: '0.5', unit: 'km' },
    ],
    location: {
      address: `${100 + i}, ${['Shree', 'Om', 'Sai', 'Krishna', 'Shanti'][i % 5]} Society, ${loc.name}`,
      locality: loc.name,
      city: 'Rajkot',
      state: 'Gujarat',
      pincode: `36000${(i % 9) + 1}`,
      coordinates: {
        type: 'Point',
        coordinates: [
          parseFloat((loc.coords[0] + (Math.random() * 0.02 - 0.01)).toFixed(6)),
          parseFloat((loc.coords[1] + (Math.random() * 0.02 - 0.01)).toFixed(6)),
        ],
      },
    },
    contact: {
      whatsapp: '+919876543210',
      email: 'kishankhunt508@gmail.com',
      phone: '+919876543210',
    },
    images: imgSet.map((url, idx) => ({
      url,
      publicId: `kishan_prop_${i}_img_${idx}`,
      isPrimary: idx === 0,
    })),
    broker: brokerId,
    isActive: true,
    isFeatured: i < 4,
    tags: ['rajkot', loc.name.toLowerCase().replace(/ /g, '-'), PROPERTY_TYPES[i]],
    impressions: { views: 0, listings: 0 },
    availableFrom: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)),
  };
}

// Generates realistic daily impression data for the past `days` days
function buildImpressionLogs(propertyIds, days = 60) {
  const logs = [];
  const now = new Date();

  for (let d = days; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    // Trend: recent days have more activity (linear growth)
    const trendFactor = 0.5 + (days - d) / days;

    for (const propId of propertyIds) {
      const base = isWeekend ? 3 : 6;
      const views = Math.max(1, Math.round((base + Math.floor(Math.random() * 8)) * trendFactor));
      const listings = Math.max(0, Math.round((2 + Math.floor(Math.random() * 5)) * trendFactor));
      logs.push({ property: propId, date: dateStr, views, listings });
    }
  }
  return logs;
}

async function main() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');

  // ── 1. Create or reuse broker ─────────────────────────────────────────────
  let broker = await User.findOne({ email: 'kishankhunt508@gmail.com' });
  if (!broker) {
    const hashed = await bcrypt.hash('Broker@123', 12);
    broker = await User.create({
      name: 'Kishan Khunt',
      email: 'kishankhunt508@gmail.com',
      password: hashed,
      role: 'broker',
      phone: '+919876543210',
      whatsapp: '+919876543210',
      isActive: true,
    });
    console.log('👤 Broker created:', broker.email);
  } else {
    console.log('👤 Broker already exists:', broker.email);
  }

  // ── 2. Remove any previous seeded properties for this broker ─────────────
  const deleted = await Property.deleteMany({ broker: broker._id });
  console.log(`🗑️  Removed ${deleted.deletedCount} existing properties`);

  // Also remove old impression logs for this broker's properties (cleared next)
  // (they'll be re-created below)

  // ── 3. Create 20 properties ───────────────────────────────────────────────
  const propertyDocs = [];
  for (let i = 0; i < 20; i++) {
    propertyDocs.push(makeProperty(i, broker._id));
  }
  const createdProps = await Property.insertMany(propertyDocs);
  console.log(`🏘️  Created ${createdProps.length} properties`);

  // ── 4. Build 60-day impression logs ───────────────────────────────────────
  const propIds = createdProps.map(p => p._id);

  // Remove stale logs
  await ImpressionLog.deleteMany({ property: { $in: propIds } });

  const logs = buildImpressionLogs(propIds, 60);
  await ImpressionLog.insertMany(logs, { ordered: false }).catch(() => {});
  console.log(`📈 Inserted ${logs.length} impression log entries (60 days × ${propIds.length} properties)`);

  // ── 5. Roll up totals onto each property ─────────────────────────────────
  const totals = logs.reduce((acc, log) => {
    const key = log.property.toString();
    if (!acc[key]) acc[key] = { views: 0, listings: 0 };
    acc[key].views    += log.views;
    acc[key].listings += log.listings;
    return acc;
  }, {});

  const bulkOps = Object.entries(totals).map(([propId, t]) => ({
    updateOne: {
      filter: { _id: propId },
      update: { $set: { 'impressions.views': t.views, 'impressions.listings': t.listings } },
    },
  }));
  await Property.bulkWrite(bulkOps);
  console.log('✅ Impression totals updated on properties');

  const totalViews    = Object.values(totals).reduce((s, t) => s + t.views, 0);
  const totalListings = Object.values(totals).reduce((s, t) => s + t.listings, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Broker  : ${broker.name} (${broker.email})`);
  console.log(`   Password: Broker@123`);
  console.log(`   Props   : ${createdProps.length}`);
  console.log(`   Views   : ${totalViews.toLocaleString()} (60d total)`);
  console.log(`   Listings: ${totalListings.toLocaleString()} (60d total)`);

  await mongoose.disconnect();
  console.log('\n🎉 Done! Log in at /login with kishankhunt508@gmail.com / Broker@123');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
