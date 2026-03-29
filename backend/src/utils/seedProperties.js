// ─────────────────────────────────────────────────────────────────────────────
// SEED: 130+ Rajkot properties covering EVERY filter combination
//   monthly + per-day | all property types | all tenant/occupancy/furnishing
//   rent presets: <4K, 4-6K, 6-8K, 8K+ (monthly) | 500-5000/day (per-day)
//   isVerified, mealsIncluded, availableNow, all amenities, all localities
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');

// ─── Rajkot Areas with real coordinates ──────────────────────────────────────
const AREAS = [
  { locality: 'Kalawad Road',      city: 'Rajkot', state: 'Gujarat', pincode: '360005', lat: 22.3271, lng: 70.7723 },
  { locality: 'Gondal Road',        city: 'Rajkot', state: 'Gujarat', pincode: '360002', lat: 22.2770, lng: 70.8007 },
  { locality: 'Bhaktinagar',        city: 'Rajkot', state: 'Gujarat', pincode: '360002', lat: 22.2929, lng: 70.7945 },
  { locality: 'University Road',    city: 'Rajkot', state: 'Gujarat', pincode: '360005', lat: 22.3041, lng: 70.8019 },
  { locality: 'Race Course Road',   city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3045, lng: 70.8041 },
  { locality: 'Mavdi',              city: 'Rajkot', state: 'Gujarat', pincode: '360004', lat: 22.3112, lng: 70.7895 },
  { locality: 'Raiya Road',         city: 'Rajkot', state: 'Gujarat', pincode: '360007', lat: 22.3152, lng: 70.8211 },
  { locality: 'Tagore Road',        city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3015, lng: 70.7978 },
  { locality: 'Kuvadva Road',       city: 'Rajkot', state: 'Gujarat', pincode: '360023', lat: 22.2890, lng: 70.7714 },
  { locality: 'Malviya Nagar',      city: 'Rajkot', state: 'Gujarat', pincode: '360004', lat: 22.3021, lng: 70.8078 },
  { locality: 'Janakpuri',          city: 'Rajkot', state: 'Gujarat', pincode: '360004', lat: 22.3088, lng: 70.8101 },
  { locality: 'Airport Road',       city: 'Rajkot', state: 'Gujarat', pincode: '360006', lat: 22.3087, lng: 70.7789 },
  { locality: 'Nanamava',           city: 'Rajkot', state: 'Gujarat', pincode: '360004', lat: 22.3178, lng: 70.7856 },
  { locality: 'Karanpara',          city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3040, lng: 70.7901 },
  { locality: '150 Ft Ring Road',   city: 'Rajkot', state: 'Gujarat', pincode: '360005', lat: 22.3120, lng: 70.7980 },
  { locality: 'Kothariya Road',     city: 'Rajkot', state: 'Gujarat', pincode: '360022', lat: 22.2850, lng: 70.8100 },
  { locality: 'Yoginagar',          city: 'Rajkot', state: 'Gujarat', pincode: '360007', lat: 22.3201, lng: 70.8071 },
  { locality: 'Sadhuvasvani Road',  city: 'Rajkot', state: 'Gujarat', pincode: '360005', lat: 22.3055, lng: 70.7850 },
  { locality: 'Aji Dam',            city: 'Rajkot', state: 'Gujarat', pincode: '360003', lat: 22.3233, lng: 70.7714 },
  { locality: 'Nirmala Road',       city: 'Rajkot', state: 'Gujarat', pincode: '360002', lat: 22.3163, lng: 70.7966 },
  { locality: 'Patel Colony',       city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3060, lng: 70.8065 },
  { locality: 'Amin Marg',          city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3080, lng: 70.7955 },
  { locality: 'Rajkot New City',    city: 'Rajkot', state: 'Gujarat', pincode: '360011', lat: 22.2980, lng: 70.7832 },
  { locality: 'Shapar Veraval',     city: 'Rajkot', state: 'Gujarat', pincode: '360024', lat: 22.2650, lng: 70.8350 },
  { locality: 'Metoda GIDC',        city: 'Rajkot', state: 'Gujarat', pincode: '360021', lat: 22.3390, lng: 70.7580 },
];

// ─── Image pools by property type (reliable Unsplash URLs) ───────────────────
const IMAGES = {
  flat: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80',
    'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=700&q=80',
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=700&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=700&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=700&q=80',
  ],
  studio: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=700&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=700&q=80',
  ],
  duplex: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=700&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=700&q=80',
  ],
  bungalow: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=700&q=80',
  ],
  pg: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=80',
    'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=700&q=80',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=700&q=80',
  ],
  tenement: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=700&q=80',
    'https://images.unsplash.com/photo-1504507926084-34cf0b939964?w=700&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80',
    'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=700&q=80',
  ],
  farmhouse: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
  ],
  penthouse: [
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=700&q=80',
    'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=700&q=80',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=700&q=80',
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand    = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const round5  = (n) => Math.round(n / 500) * 500;
const jitter  = (v, s = 0.005) => +(v + (Math.random() - 0.5) * s).toFixed(6);

const SOCIETY_NAMES = ['Shree Complex','Om Residency','Hari Niwas','Shiv Shakti Flats','Ganesh Heights',
  'Jay Apartment','Vraj Society','Patel Nivas','Ambica Park','Riddhi Siddhi Complex',
  'Krishna Kunj','Sai Paradise','Radha Residency','Tulsi Vihar','Nandan Heights'];

const TYPE_LABELS = {
  flat:'Flat', tenement:'Tenement', villa:'Villa', studio:'Studio Apartment',
  duplex:'Duplex', penthouse:'Penthouse', bungalow:'Bungalow', pg:'PG',
  farmhouse:'Farmhouse', commercial:'Commercial Space',
};

const ALL_AMENITIES = [
  'gym','swimming-pool','parking','lift','security','cctv','power-backup',
  'wifi','ac','gas-pipeline','intercom','club-house','garden','kids-play-area',
  'jogging-track','laundry','meals-included',
];

// ─── Core property builder ────────────────────────────────────────────────────
function makeProperty(opts) {
  const {
    area, type, tenantType, occupancy, furnishing,
    rentType,        // 'monthly' | 'per-day'
    rentAmount,      // explicit rent (optional override)
    isVerified,
    hasMeals,
    availableNow,    // bool: true = already available, false = future
    brokerId, idx,
    status,
  } = opts;

  // Beds / baths
  const beds  = ['studio','commercial'].includes(type) ? 0 : type === 'pg' ? 1 : randInt(1, 4);
  const baths = Math.max(1, Math.ceil(beds * 0.75));

  // Rent
  const monthlyMap  = {
    pg: [2500,8000], studio:[5000,12000], tenement:[4000,15000], flat:[7000,35000],
    duplex:[18000,55000], villa:[30000,80000], bungalow:[25000,70000],
    farmhouse:[20000,60000], commercial:[10000,50000], penthouse:[40000,90000],
  };
  const perDayMap = {
    pg:[200,800], studio:[500,1500], flat:[1200,3000], tenement:[800,2000],
    duplex:[2500,5000], villa:[3500,8000], bungalow:[3000,7000],
    farmhouse:[4000,10000], commercial:[1500,5000], penthouse:[5000,12000],
  };
  const [rMin, rMax] = rentType === 'per-day' ? (perDayMap[type]||[500,3000]) : (monthlyMap[type]||[8000,30000]);
  const rent = rentAmount !== undefined ? rentAmount : round5(randInt(rMin, rMax));
  const deposit = rentType === 'monthly' ? rent * randInt(1, 3) : 0;

  // Area size
  const areaSize = { studio:randInt(200,450), flat:randInt(550,1500), tenement:randInt(400,900),
    duplex:randInt(1200,2500), villa:randInt(2000,5000), bungalow:randInt(1500,4000),
    commercial:randInt(300,2000), pg:randInt(80,300), farmhouse:randInt(3000,8000),
    penthouse:randInt(1500,3000) }[type] || randInt(400,1200);

  // Amenities
  const basePool = ALL_AMENITIES.filter(a => a !== 'meals-included');
  const picked   = [...basePool].sort(()=>Math.random()-0.5).slice(0, randInt(3,9));
  if (hasMeals) picked.push('meals-included');
  if (type === 'pg') { ['wifi','laundry'].forEach(a=>{ if(!picked.includes(a)) picked.push(a); }); }

  // Labels
  const bedLabel = beds === 0 ? '' : `${beds} BHK `;
  const tenantSuffix = tenantType==='family' ? ' – Family Only' : tenantType==='bachelor' ? ' – Bachelor Friendly' : '';
  const rentLabel  = rentType==='per-day' ? '/day' : '/mo';
  const title = `${bedLabel}${TYPE_LABELS[type]||type} in ${area.locality}${tenantSuffix}`;

  const desc = `${furnishing==='fully-furnished'?'Fully furnished':'furnishing==="semi-furnished"?"Semi-furnished":"Unfurnished"'} ${bedLabel}${type} available for ${rentType==='per-day'?'daily':'monthly'} rent in ${area.locality}, Rajkot. ` +
    `Ideal for ${tenantType==='family'?'families':tenantType==='bachelor'?'working professionals & students':'all tenants'}. ` +
    `${hasMeals?'Meals included.':''} ${isVerified?'Verified listing.':''}`;

  // Nearby
  const nearbyPool = ['hospital','school','market','bank','bus-stop','restaurant','pharmacy','college','gym'];
  const nearby = nearbyPool.slice(0,randInt(2,5)).map(t=>({
    name:`${area.locality} ${t.charAt(0).toUpperCase()+t.slice(1)}`,
    type:t, distance:+(Math.random()*2+0.1).toFixed(1), unit:'km',
  }));

  const imgPool = IMAGES[type] || IMAGES.flat;
  const images = [
    { url: imgPool[idx % imgPool.length],        publicId:'', isPrimary:true  },
    { url: imgPool[(idx+1) % imgPool.length],     publicId:'', isPrimary:false },
  ];

  // availableFrom: past = already available now, future = x days away
  const daysOffset = availableNow ? -randInt(1,15) : randInt(1,45);
  const availableFrom = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);

  return {
    title,
    description: desc,
    propertyType: type,
    status: status || rand(['available','available','available','rented']),
    tenantType,
    occupancy,
    isVerified,
    rent: { amount: rent, type: rentType, isNegotiable: Math.random() > 0.55, deposit },
    area: { size: areaSize, unit: 'sqft' },
    bedrooms: beds,
    bathrooms: baths,
    furnishing,
    amenities: picked,
    nearbyFacilities: nearby,
    images,
    location: {
      address: `${randInt(1,99)}, ${rand(SOCIETY_NAMES)}, ${area.locality}`,
      locality: area.locality,
      city:   area.city,
      state:  area.state,
      pincode:area.pincode,
      coordinates: { type:'Point', coordinates:[jitter(area.lng), jitter(area.lat)] },
    },
    contact: {
      whatsapp:`+9198${randInt(10,99)}${randInt(100000,999999)}`,
      phone:   `+9179${randInt(10,99)}${randInt(100000,999999)}`,
      email:   `broker@rentpro.com`,
    },
    broker: brokerId,
    isFeatured: Math.random() > 0.80,
    isActive: true,
    tags: [area.locality.toLowerCase().replace(/\s+/g,'-'), type, tenantType, rentType],
    availableFrom,
    impressions: { views: randInt(10,600), listings: randInt(5,250) },
  };
}

// ─── Main seed ────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  await Property.deleteMany({});
  console.log('🗑  Cleared existing properties');

  // ── Brokers ──
  const brokerData = [
    { name:'Ravi Patel',    email:'ravi@rentpro.com',    phone:'+919825001001', whatsapp:'+919825001001' },
    { name:'Sneha Shah',    email:'sneha@rentpro.com',   phone:'+919825001002', whatsapp:'+919825001002' },
    { name:'Amit Kothari',  email:'amit@rentpro.com',    phone:'+919825001003', whatsapp:'+919825001003' },
    { name:'Priya Mehta',   email:'priya@rentpro.com',   phone:'+919825001004', whatsapp:'+919825001004' },
    { name:'Kiran Solanki', email:'kiran@rentpro.com',   phone:'+919825001005', whatsapp:'+919825001005' },
  ];
  const brokers = [];
  for (const bd of brokerData) {
    let b = await User.findOne({ email: bd.email });
    if (!b) b = await User.create({ ...bd, password:'Broker@123', role:'broker', isActive:true });
    else { b.password = 'Broker@123'; await b.save(); }
    brokers.push(b);
  }
  console.log(`✅ ${brokers.length} brokers ready`);

  const properties = [];
  let idx = 0;
  const B = (i) => brokers[i % brokers.length]._id;

  // ════════════════════════════════════════════════════════════════════
  // SECTION 1 — GUARANTEED MONTHLY RENT PRESET COVERAGE
  // Each preset bucket guaranteed across multiple property types
  // ════════════════════════════════════════════════════════════════════

  // ── Under ₹4,000/month ── (PG rooms, small tenements)
  const under4kCombos = [
    { type:'pg',       tenant:'bachelor', occ:'boys',  furnished:'unfurnished', rent:2500, meals:true,  verified:true },
    { type:'pg',       tenant:'bachelor', occ:'girls', furnished:'unfurnished', rent:3000, meals:true,  verified:false },
    { type:'pg',       tenant:'any',      occ:'coed',  furnished:'semi-furnished', rent:3500, meals:true,  verified:true  },
    { type:'tenement', tenant:'family',   occ:'any',   furnished:'unfurnished', rent:3800, meals:false, verified:false },
    { type:'pg',       tenant:'bachelor', occ:'boys',  furnished:'fully-furnished', rent:2800, meals:true,  verified:true  },
    { type:'tenement', tenant:'bachelor', occ:'boys',  furnished:'unfurnished', rent:3200, meals:false, verified:false },
  ];
  under4kCombos.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[i%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:c.furnished, rentType:'monthly', rentAmount:c.rent,
      isVerified:c.verified, hasMeals:c.meals, availableNow:i%2===0, brokerId:B(i), idx:idx++ }));
  });

  // ── ₹4,000–₹6,000/month ──
  const range4to6 = [
    { type:'pg',       tenant:'bachelor', occ:'boys',  furnished:'semi-furnished', rent:4500, meals:true,  verified:true  },
    { type:'pg',       tenant:'bachelor', occ:'girls', furnished:'fully-furnished',rent:5000, meals:true,  verified:true  },
    { type:'studio',   tenant:'bachelor', occ:'coed',  furnished:'unfurnished',    rent:5500, meals:false, verified:false },
    { type:'tenement', tenant:'family',   occ:'any',   furnished:'unfurnished',    rent:4800, meals:false, verified:true  },
    { type:'tenement', tenant:'any',      occ:'any',   furnished:'semi-furnished', rent:5800, meals:false, verified:false },
    { type:'studio',   tenant:'bachelor', occ:'boys',  furnished:'semi-furnished', rent:4200, meals:true,  verified:true  },
  ];
  range4to6.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+5)%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:c.furnished, rentType:'monthly', rentAmount:c.rent,
      isVerified:c.verified, hasMeals:c.meals, availableNow:i%2===0, brokerId:B(i), idx:idx++ }));
  });

  // ── ₹6,000–₹8,000/month ──
  const range6to8 = [
    { type:'flat',     tenant:'bachelor', occ:'boys',  furnished:'unfurnished',    rent:6500, meals:false, verified:true  },
    { type:'studio',   tenant:'any',      occ:'coed',  furnished:'fully-furnished',rent:7500, meals:false, verified:true  },
    { type:'flat',     tenant:'family',   occ:'any',   furnished:'semi-furnished', rent:7000, meals:false, verified:false },
    { type:'tenement', tenant:'any',      occ:'any',   furnished:'fully-furnished',rent:6800, meals:true,  verified:true  },
    { type:'studio',   tenant:'bachelor', occ:'girls', furnished:'semi-furnished', rent:7200, meals:true,  verified:false },
    { type:'flat',     tenant:'bachelor', occ:'coed',  furnished:'unfurnished',    rent:6000, meals:false, verified:false },
  ];
  range6to8.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+10)%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:c.furnished, rentType:'monthly', rentAmount:c.rent,
      isVerified:c.verified, hasMeals:c.meals, availableNow:i%3===0, brokerId:B(i), idx:idx++ }));
  });

  // ── ₹8,000+/month ──
  const above8k = [
    { type:'flat',      tenant:'family',   occ:'any',   furnished:'semi-furnished', rent:12000, meals:false, verified:true  },
    { type:'flat',      tenant:'bachelor', occ:'boys',  furnished:'fully-furnished',rent:15000, meals:false, verified:true  },
    { type:'flat',      tenant:'family',   occ:'any',   furnished:'unfurnished',    rent:9000,  meals:false, verified:false },
    { type:'duplex',    tenant:'family',   occ:'any',   furnished:'fully-furnished',rent:28000, meals:false, verified:true  },
    { type:'villa',     tenant:'family',   occ:'any',   furnished:'fully-furnished',rent:50000, meals:false, verified:true  },
    { type:'bungalow',  tenant:'family',   occ:'any',   furnished:'semi-furnished', rent:35000, meals:false, verified:false },
    { type:'penthouse', tenant:'any',      occ:'any',   furnished:'fully-furnished',rent:60000, meals:false, verified:true  },
    { type:'farmhouse', tenant:'family',   occ:'any',   furnished:'semi-furnished', rent:22000, meals:false, verified:false },
    { type:'commercial',tenant:'any',      occ:'any',   furnished:'unfurnished',    rent:18000, meals:false, verified:true  },
    { type:'flat',      tenant:'any',      occ:'coed',  furnished:'semi-furnished', rent:11000, meals:false, verified:false },
    { type:'duplex',    tenant:'bachelor', occ:'coed',  furnished:'fully-furnished',rent:22000, meals:false, verified:true  },
    { type:'flat',      tenant:'family',   occ:'any',   furnished:'unfurnished',    rent:8500,  meals:false, verified:true  },
  ];
  above8k.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+15)%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:c.furnished, rentType:'monthly', rentAmount:c.rent,
      isVerified:c.verified, hasMeals:c.meals, availableNow:i%3===0, brokerId:B(i), idx:idx++ }));
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 2 — PER-DAY RENT (all property types)
  // ════════════════════════════════════════════════════════════════════
  const perDayCombos = [
    { type:'pg',        tenant:'bachelor', occ:'boys',  furnished:'fully-furnished', rent:350,  meals:true,  verified:true  },
    { type:'pg',        tenant:'bachelor', occ:'girls', furnished:'fully-furnished', rent:400,  meals:true,  verified:true  },
    { type:'studio',    tenant:'any',      occ:'coed',  furnished:'fully-furnished', rent:800,  meals:false, verified:true  },
    { type:'studio',    tenant:'bachelor', occ:'boys',  furnished:'semi-furnished',  rent:600,  meals:false, verified:false },
    { type:'flat',      tenant:'any',      occ:'any',   furnished:'fully-furnished', rent:1500, meals:false, verified:true  },
    { type:'flat',      tenant:'family',   occ:'any',   furnished:'fully-furnished', rent:2000, meals:false, verified:true  },
    { type:'flat',      tenant:'bachelor', occ:'coed',  furnished:'semi-furnished',  rent:1200, meals:false, verified:false },
    { type:'tenement',  tenant:'any',      occ:'any',   furnished:'semi-furnished',  rent:1000, meals:true,  verified:false },
    { type:'duplex',    tenant:'family',   occ:'any',   furnished:'fully-furnished', rent:3000, meals:false, verified:true  },
    { type:'duplex',    tenant:'any',      occ:'any',   furnished:'fully-furnished', rent:3500, meals:false, verified:false },
    { type:'villa',     tenant:'family',   occ:'any',   furnished:'fully-furnished', rent:5000, meals:false, verified:true  },
    { type:'villa',     tenant:'any',      occ:'any',   furnished:'fully-furnished', rent:4500, meals:false, verified:true  },
    { type:'bungalow',  tenant:'family',   occ:'any',   furnished:'fully-furnished', rent:4000, meals:false, verified:true  },
    { type:'bungalow',  tenant:'any',      occ:'any',   furnished:'semi-furnished',  rent:3200, meals:false, verified:false },
    { type:'farmhouse', tenant:'family',   occ:'any',   furnished:'fully-furnished', rent:6000, meals:false, verified:true  },
    { type:'penthouse', tenant:'any',      occ:'any',   furnished:'fully-furnished', rent:7000, meals:false, verified:true  },
    { type:'commercial',tenant:'any',      occ:'any',   furnished:'unfurnished',     rent:2500, meals:false, verified:false },
    { type:'commercial',tenant:'any',      occ:'any',   furnished:'semi-furnished',  rent:3000, meals:false, verified:true  },
  ];
  perDayCombos.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+3)%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:c.furnished, rentType:'per-day', rentAmount:c.rent,
      isVerified:c.verified, hasMeals:c.meals, availableNow:i%2===0, brokerId:B(i), idx:idx++ }));
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 3 — ALL FILTER ATTRIBUTE COVERAGE
  // Guarantees every occupancy type, furnishing, tenant, amenity bucket
  // ════════════════════════════════════════════════════════════════════

  // All occupancy types × tenant types (monthly + per-day mix)
  const occTenantMatrix = [
    { occ:'boys',  tenant:'bachelor', type:'flat',   rentType:'monthly',  rent:9000  },
    { occ:'girls', tenant:'bachelor', type:'flat',   rentType:'monthly',  rent:8500  },
    { occ:'coed',  tenant:'bachelor', type:'studio', rentType:'monthly',  rent:7000  },
    { occ:'any',   tenant:'family',   type:'flat',   rentType:'monthly',  rent:14000 },
    { occ:'boys',  tenant:'bachelor', type:'pg',     rentType:'per-day',  rent:450   },
    { occ:'girls', tenant:'bachelor', type:'pg',     rentType:'per-day',  rent:500   },
    { occ:'coed',  tenant:'any',      type:'studio', rentType:'per-day',  rent:900   },
    { occ:'any',   tenant:'any',      type:'flat',   rentType:'per-day',  rent:1800  },
  ];
  occTenantMatrix.forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+7)%AREAS.length], type:c.type, tenantType:c.tenant,
      occupancy:c.occ, furnishing:rand(['unfurnished','semi-furnished','fully-furnished']),
      rentType:c.rentType, rentAmount:c.rent,
      isVerified:i%2===0, hasMeals:c.type==='pg', availableNow:i%3===0, brokerId:B(i), idx:idx++ }));
  });

  // All furnishing types × available now
  [
    { furnished:'unfurnished',     availableNow:true  },
    { furnished:'semi-furnished',  availableNow:true  },
    { furnished:'fully-furnished', availableNow:true  },
    { furnished:'unfurnished',     availableNow:false },
    { furnished:'semi-furnished',  availableNow:false },
    { furnished:'fully-furnished', availableNow:false },
  ].forEach((c, i) => {
    properties.push(makeProperty({ area:AREAS[(i+12)%AREAS.length], type:'flat',
      tenantType:rand(['any','family','bachelor']), occupancy:rand(['any','boys','girls','coed']),
      furnishing:c.furnished, rentType:'monthly', rentAmount:round5(randInt(7000,25000)),
      isVerified:i%2===0, hasMeals:false, availableNow:c.availableNow, brokerId:B(i), idx:idx++ }));
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 4 — RANDOM FILL across all localities (ensures every area has data)
  // ════════════════════════════════════════════════════════════════════
  const ALL_TYPES    = ['flat','flat','flat','tenement','tenement','studio','studio','duplex','villa','bungalow','pg','pg','commercial','farmhouse','penthouse'];
  const ALL_TENANTS  = ['any','any','any','family','family','bachelor','bachelor'];
  const ALL_OCC      = ['any','any','any','boys','girls','coed'];
  const ALL_FURNISH  = ['unfurnished','semi-furnished','fully-furnished'];
  const RENT_TYPES   = ['monthly','monthly','monthly','monthly','per-day','per-day'];

  for (let i = 0; i < 80; i++) {
    const area      = AREAS[i % AREAS.length];
    const type      = ALL_TYPES[i % ALL_TYPES.length];
    const rentType  = RENT_TYPES[i % RENT_TYPES.length];
    const tenant    = ALL_TENANTS[i % ALL_TENANTS.length];
    const occ       = ALL_OCC[i % ALL_OCC.length];
    const furnished = ALL_FURNISH[i % ALL_FURNISH.length];
    const hasMeals  = (type === 'pg' || i % 5 === 0);
    const verified  = i % 2 === 0;
    const availNow  = i % 3 === 0;

    properties.push(makeProperty({
      area, type, tenantType: tenant, occupancy: occ, furnishing: furnished,
      rentType, rentAmount: undefined, isVerified: verified,
      hasMeals, availableNow: availNow, brokerId: B(i), idx: idx++,
    }));
  }

  await Property.insertMany(properties);

  // ── Summary ──
  const tCount = {}, oCount = {}, rCount = {}, ptCount = {};
  properties.forEach(p => {
    tCount[p.tenantType]   = (tCount[p.tenantType]   || 0) + 1;
    oCount[p.occupancy]    = (oCount[p.occupancy]     || 0) + 1;
    rCount[p.rent.type]    = (rCount[p.rent.type]     || 0) + 1;
    ptCount[p.propertyType]= (ptCount[p.propertyType] || 0) + 1;
  });

  const verified   = properties.filter(p => p.isVerified).length;
  const withMeals  = properties.filter(p => p.amenities.includes('meals-included')).length;
  const availNow   = properties.filter(p => p.availableFrom <= new Date()).length;

  console.log(`\n✅ Seeded ${properties.length} properties across ${AREAS.length} Rajkot areas\n`);
  console.log('📊 By property type:', ptCount);
  console.log('👥 By tenant type  :', tCount);
  console.log('🏠 By occupancy    :', oCount);
  console.log('💰 By rent type    :', rCount);
  console.log(`✅ Verified        : ${verified}`);
  console.log(`🍽️  With meals      : ${withMeals}`);
  console.log(`🔑 Available now   : ${availNow}`);
  console.log('\n🔑 Broker login (all): Broker@123');
  brokerData.forEach(b => console.log(`   ${b.email}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
