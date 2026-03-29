# 🏠 RentPro — Housing Rent Management System

> A production-ready, full-stack **3-role rental platform** built for the Rajkot rental market.  
> Roles: **Admin · Broker · Public User**

**Tech Stack**
- **Frontend** — React 18 · Vite · TailwindCSS · Framer Motion · React Query · Zustand · Recharts · Leaflet
- **Backend** — Node.js · Express · MongoDB Atlas · Mongoose · Socket.IO · Multer · JWT
- **Real-time** — Socket.IO (graceful fallback — works without it)
- **Maps** — Leaflet + OpenStreetMap (zero API key required)
- **Images** — Local disk storage via Multer (Cloudinary-ready)
- **Cache** — node-cache in-memory (no Redis required)

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Login Credentials](#-login-credentials)
3. [User Roles Overview](#-user-roles-overview)
4. [Public User Features](#-public-user-features)
5. [Broker Features](#-broker-features)
6. [Admin Features](#-admin-features)
7. [Real-Time Notifications](#-real-time-notifications-socketio)
8. [Property Search & Filters](#-property-search--filters)
9. [Inquiry System](#-inquiry-system)
10. [Impression Analytics](#-impression-analytics)
11. [Pages & Routes](#-pages--routes)
12. [API Reference](#-api-reference)
13. [Project Structure](#-project-structure)
14. [Database Design](#-database-design)
15. [Architecture Decisions](#-architecture-decisions)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Internet connection (MongoDB Atlas is pre-configured — no local MongoDB needed)

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Start the backend (Terminal 1)
```bash
npm run dev:backend
```
API available at: `http://localhost:5000`

### 3. Start the frontend (Terminal 2)
```bash
npm run dev:frontend
```
App available at: `http://localhost:5173`

### 4. (Optional) Re-seed demo data
```bash
# Seed admin + 5 broker accounts
npm run seed

# Seed 142 demo properties across Rajkot
npm run seed:properties

# Seed demo broker (Kishan Khunt) with 20 properties + 60-day analytics
node backend/src/utils/seedKishan.js
```

> **Windows one-liner** — starts both servers in separate terminal windows:
> ```bash
> npm run dev
> ```

---

## 🔑 Login Credentials

### Admin
| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@rentpro.com`    |
| Password | `Admin@123456`         |
| Role     | Full platform control  |

### Demo Broker (with 20 properties + 60-day analytics)
| Field    | Value                          |
|----------|--------------------------------|
| Email    | `kishankhunt508@gmail.com`     |
| Password | `Broker@123`                   |
| Role     | Broker                         |

### Pre-seeded Brokers (5 accounts)
| Email                  | Password     |
|------------------------|--------------|
| `ravi@rentpro.com`     | `Broker@123` |
| `sneha@rentpro.com`    | `Broker@123` |
| `amit@rentpro.com`     | `Broker@123` |
| `priya@rentpro.com`    | `Broker@123` |
| `kiran@rentpro.com`    | `Broker@123` |

> All broker accounts have pre-seeded properties distributed across 25 Rajkot localities.

---

## 👥 User Roles Overview

RentPro has three distinct roles, each with its own interface and capabilities:

| Capability                       | Public | Broker | Admin |
|----------------------------------|:------:|:------:|:-----:|
| Browse & search properties       | ✅     | ✅     | ✅    |
| View property details & map      | ✅     | ✅     | ✅    |
| Submit inquiry for a property    | ✅     | ✅     | ✅    |
| Add / edit / delete properties   | ❌     | ✅     | ✅    |
| View own inquiries with leads    | ❌     | ✅     | ✅    |
| Edit broker profile & password   | ❌     | ✅     | ✅    |
| View impression analytics chart  | ❌     | ✅     | ✅    |
| Live notification on new inquiry | ❌     | ✅     | ✅    |
| Manage all brokers (CRUD)        | ❌     | ❌     | ✅    |
| View system-wide analytics       | ❌     | ❌     | ✅    |
| View all inquiries system-wide   | ❌     | ❌     | ✅    |
| Toggle broker account status     | ❌     | ❌     | ✅    |

---

## 🌐 Public User Features

Public users (anyone visiting the site without logging in) can fully browse and enquire about properties.

### Home Page (`/`)
- **Hero search bar** with autocomplete — start typing any Rajkot area name (e.g. "Kalawad", "Mavdi", "University") and matching suggestions drop down instantly
- **Featured properties** carousel — properties marked as featured by brokers
- **Nearby properties** — shown based on Rajkot location coordinates
- **Browse by area** — quick-access locality chips to jump directly to filtered results

### Property Listing Page (`/properties`)
- **Smart search** — autocomplete search box covering 110+ Rajkot locations, societies, and landmarks
- **Advanced filters sidebar:**
  - Property type (Flat, Villa, Studio, Duplex, PG, Bungalow, Farmhouse, etc.)
  - Rent range (presets + manual min/max)
  - Rent type (Monthly / Per Day)
  - Furnishing (Unfurnished / Semi / Fully)
  - Preferred tenant (Any / Family Only / Bachelor OK)
  - Occupancy (Any / Boys / Girls / Co-ed)
  - Special filters: Featured only, Verified only, Meals Included, Available Now
  - Locality chips (25 Rajkot areas)
- **Sorting** — Price Low→High, High→Low, Newest, Most Viewed
- **Property cards** show: rent, type, furnishing, tenant type, occupancy, verification badge, primary image
- **Pagination** with page controls

### Property Detail Page (`/properties/:id`)
- Full property information — title, description, type, rent, deposit, area, bedrooms, bathrooms, furnishing
- **Image gallery** — browse all uploaded property photos
- **Interactive Leaflet map** — pin showing exact property location with popup
- Tenant type & occupancy badges
- Amenities list (gym, parking, lift, WiFi, AC, CCTV, etc.)
- Nearby facilities (hospitals, schools, markets with distance)
- Tags
- **Inquiry form** — submit name, email, phone, and message directly to the broker; triggers live socket notification to the broker/admin

---

## 🏘️ Broker Features

Brokers manage their own property portfolio and receive leads from interested tenants.

### Login & Navigation
1. Go to `/login` and sign in with broker credentials
2. The navbar shows: **My Properties · Inquiries (with live badge) · Dashboard**
3. The user avatar dropdown contains: **My Profile · Inquiries · Logout**

### Broker Dashboard (`/broker`)
The dashboard gives an at-a-glance summary of the broker's portfolio:

- **Stats cards**: Total Properties · Available Properties · Total Inquiries · New Inquiries
- **Impression Analytics Chart** — line/area chart showing daily Views and Listing Clicks for the past 30 days (powered by buffered ImpressionLog data)
- **Recent Inquiries** — latest 5 leads with inquirer name, property, status, and time
- **Recent Properties** — latest 5 listings with status and rent
- Quick action buttons: Add Property, View All Inquiries

### My Properties (`/broker/properties`)
- List of all properties owned by the broker with status badges (Available / Rented / Unavailable)
- Each card shows: primary image, title, locality, rent, property type
- **Edit** button → opens the multi-step edit form pre-filled with all existing data
- **Delete** button → soft-deletes the property (inquiry history preserved)
- Pagination and status filter

### Add Property (`/broker/properties/new`) — 4-Step Wizard

**Step 1 — Basic Info**
- Title, Description
- Property type (10 types)
- Rent amount, rent type (Monthly / Per Day), deposit
- **Preferred Tenant** selector: Any / Family Only / Bachelor OK (visual card selector)
- **Occupancy Type** selector: Any / Boys / Girls / Co-ed (visual card selector)
- Bedrooms, Bathrooms
- Furnishing type
- Area size (sqft / sqm / BHK)
- Negotiable toggle, Featured toggle
- Tags (comma-separated)

**Step 2 — Location**
- Full address, Locality, City, State, Pincode
- **GPS Coordinates** — three options:
  - Click "Use My Location" (browser geolocation)
  - Click "Rajkot Default" (auto-fills Rajkot city centre)
  - Manual entry of Longitude / Latitude (copy from Google Maps)

**Step 3 — Amenities & Nearby**
- Amenity checkboxes (15 amenities: gym, pool, parking, lift, security, WiFi, AC, etc.)
- Nearby facilities builder — add hospitals, schools, markets with name, type, and distance

**Step 4 — Images & Contact**
- Upload up to 10 property photos (JPG, PNG, WebP)
- At least one image required
- Contact details: WhatsApp, Email, Phone (auto-filled from broker profile)

### Edit Property (`/broker/properties/:id/edit`)
- All 4 steps pre-filled with existing property data
- **Current Images section** shows all uploaded images with individual remove (×) buttons — clicking × deletes that image from the server immediately
- Upload additional images in the "New Uploads" section
- No images required if at least one existing image remains

### My Inquiries (`/broker/inquiries`)
- Full paginated list of all inquiries received for the broker's properties
- **Status filter tabs**: All · New · Contacted · Closed
- Each inquiry card shows:
  - Inquirer name + status badge + channel (form/WhatsApp/call)
  - **Property link** (clickable, opens in new tab) with ↗ icon
  - Message preview
  - Timestamp
- **Expand any card** to see:
  - Phone (click to call), Email (click to email), WhatsApp quick message link
  - Full message text
  - **View Property button** — opens the property listing page in a new tab
  - Status updater — change status to New / Contacted / Closed
- **Live badge** on the "Inquiries" navbar link — shows count of new unread inquiries, updates in real-time via Socket.IO

### My Profile (`/broker/profile`)
Available from the user avatar dropdown:

**Edit Profile section**
- Update Full Name, Phone, WhatsApp number
- Changes reflect across all contact-prefilled property forms

**Change Password section**
- Enter current password, new password (min 8 chars), confirm new password
- Password strength validation with live match indicator
- Show/hide toggles for all three fields

---

## 🛡️ Admin Features

The Admin has full platform oversight — all properties, all brokers, all inquiries system-wide.

### Admin Dashboard (`/admin`)

**Overview Tab**
- **Stats cards**: Total Properties · Active Brokers · Total Inquiries · Verified Properties
- **Property Type Breakdown** — donut/pie chart showing distribution (flat, villa, studio, PG, etc.)
- **Top Performing Brokers** — ranked by property count with listings and inquiry counts
- **Recent Inquiries table** — latest inquiries system-wide with:
  - Inquirer name, property title (linked), broker name, date
  - **View** (↗) link to open the property in a new tab

**Brokers Tab**
- Paginated table of all broker accounts
- Columns: Name + Email, Property Count, Joined Date, Status (Active/Inactive)
- **Toggle Active/Inactive** — enable or disable a broker account (deactivated brokers cannot log in)
- **Delete broker** — removes the account (with confirmation)
- **Create Broker button** — opens a modal to create a new broker:
  - Required: Full Name, Email, Password
  - Optional: Phone, WhatsApp
  - Broker receives the credentials and can immediately log in

**Inquiries Tab**
- Complete system-wide inquiry log
- Each card shows: Inquirer name, Property title (clickable link), Broker name, Date
- **↗ icon button** on each card — opens the property in a new tab

---

## 🔔 Real-Time Notifications (Socket.IO)

When any user submits an inquiry for a property, the relevant broker and all admin users get notified **instantly** — no page refresh required.

### How It Works
1. User fills the inquiry form on a property page and clicks "Send Inquiry"
2. Backend saves the inquiry to MongoDB
3. Backend emits `inquiry:new` event via Socket.IO to:
   - The broker's personal room (`broker:{brokerId}`)
   - The shared admin room (`admin`)
4. Every connected broker/admin browser receives the event and:
   - A **toast notification** pops up: `"New Inquiry! · [Name] › [Property Title]"`
   - The **inquiry list** on `/broker/inquiries` refreshes automatically
   - The **navbar badge** count updates instantly
   - The **broker dashboard** recent inquiries section refreshes
   - The **admin analytics** counts update

### Graceful Fallback
Socket.IO is entirely optional. If the socket server is unavailable or the network blocks WebSockets:
- All inquiry submission and retrieval still works normally via REST API
- No errors are shown to users
- The app simply operates without real-time push (polling still works every 30s for badge count)

---

## 🔍 Property Search & Filters

### Text Search
- Weighted MongoDB full-text index:
  - Title — weight 10 (highest priority)
  - Locality — weight 8
  - Tags — weight 6
  - Description — weight 2
- Type partial locality names to match (e.g., "kalawad" matches "Kalawad Road")

### Autocomplete
- 110+ Rajkot locations: named areas, residential societies, landmarks, roads
- Suggestions appear as you type — click to apply instantly
- Works on both Home page hero and Properties listing page

### Filters Available
| Filter           | Values / Range                                      |
|------------------|-----------------------------------------------------|
| Property Type    | flat, tenement, villa, studio, duplex, penthouse, bungalow, farmhouse, commercial, pg |
| Min / Max Rent   | Any amount in ₹                                     |
| Rent Type        | Monthly, Per Day                                    |
| Furnishing       | Unfurnished, Semi-Furnished, Fully-Furnished        |
| Preferred Tenant | Any, Family Only, Bachelor OK                       |
| Occupancy        | Any, Boys Only, Girls Only, Co-ed                   |
| Locality         | 25 Rajkot areas (chip selector)                     |
| Featured         | Show featured properties only                       |
| Verified         | Show verified properties only                       |
| Meals Included   | For PG / hostel type                                |
| Available Now    | Properties currently available                      |

### Sorting
- Newest First (default)
- Price: Low → High
- Price: High → Low
- Most Viewed (by impression count)

### Geospatial (Nearby)
- `GET /api/properties/nearby?lat=22.30&lng=70.80&radius=5` — returns properties within 5 km radius using MongoDB `$near` (2dsphere index)

---

## 📩 Inquiry System

### User Submits Inquiry
1. Open any property detail page
2. Scroll to the inquiry form (right side panel)
3. Enter: Name (required), Email, Phone, Message (required)
4. Click "Send Inquiry"
5. A toast confirms submission; broker is notified live

### Broker Receives & Manages Inquiries
1. Live toast appears: "New Inquiry! · [Name] › [Property]"
2. Navbar **Inquiries** badge shows new count (red dot)
3. Go to **My Inquiries** page — new inquiry appears at the top
4. Click the card to expand:
   - See full contact details (phone, email, WhatsApp link)
   - Read full message
   - Click **View Property** button to see the exact listing
   - Update status: **New → Contacted → Closed**

### Admin Views All Inquiries
- Admin dashboard Overview tab shows recent 10 inquiries (all brokers)
- Inquiries tab shows the full system log with broker attribution
- Each entry has a clickable property link

---

## 📊 Impression Analytics

Every property tracks two types of impressions:

| Impression Type | When Recorded                                    |
|-----------------|--------------------------------------------------|
| **View**        | Every time a user opens the property detail page |
| **Listing**     | Every time the property appears in search results |

### Buffering (Performance)
- Impressions are **not** written to MongoDB on every request
- They accumulate in-memory for 60 seconds, then bulk-flushed
- This prevents write amplification on high-traffic listings
- The `ImpressionLog` collection stores one document per property per day

### Broker Analytics Chart
- Located on the **Broker Dashboard** — "Impressions (Last 30 Days)"
- Line/area chart with two series: Views (blue) and Listings (orange)
- X-axis: dates, Y-axis: daily count
- Powered by Recharts

### Demo Data
The demo broker (`kishankhunt508@gmail.com`) has **60 days** of pre-seeded impression history:
- 20 properties × 61 days = 1,220 daily log entries
- **~10,661 total views**, **~4,961 total listings**
- Trend: recent days show higher activity (realistic growth curve)

---

## 📱 Pages & Routes

| Page                  | URL                              | Access       |
|-----------------------|----------------------------------|--------------|
| Home                  | `/`                              | Public       |
| Property Listing      | `/properties`                    | Public       |
| Property Detail       | `/properties/:id`                | Public       |
| Login                 | `/login`                         | Public       |
| Broker Dashboard      | `/broker`                        | Broker/Admin |
| My Properties         | `/broker/properties`             | Broker/Admin |
| Add Property          | `/broker/properties/new`         | Broker/Admin |
| Edit Property         | `/broker/properties/:id/edit`    | Broker/Admin |
| My Inquiries          | `/broker/inquiries`              | Broker/Admin |
| My Profile            | `/broker/profile`                | Broker/Admin |
| Admin Dashboard       | `/admin`                         | Admin only   |

> Unauthenticated users attempting to visit protected routes are redirected to `/login`.  
> Brokers attempting to visit `/admin` are blocked with a 403 error.

---

## 🌐 API Reference

### Authentication
| Method | Endpoint                     | Body / Notes              |
|--------|------------------------------|---------------------------|
| POST   | `/api/auth/login`            | `{ email, password }`     |
| GET    | `/api/auth/me`               | Bearer token required     |
| PATCH  | `/api/auth/update-profile`   | `{ name, phone, whatsapp }` |
| PATCH  | `/api/auth/change-password`  | `{ currentPassword, newPassword }` |

### Properties — Public
| Method | Endpoint                          | Query Params                                     |
|--------|-----------------------------------|--------------------------------------------------|
| GET    | `/api/properties`                 | `q, propertyType, minRent, maxRent, furnishing, tenantType, occupancy, locality, rentType, isFeatured, isVerified, mealsIncluded, availableNow, sortBy, page, limit` |
| GET    | `/api/properties/featured`        | —                                                |
| GET    | `/api/properties/nearby`          | `lat, lng, radius, limit`                        |
| GET    | `/api/properties/:id`             | —                                                |
| POST   | `/api/properties/:id/inquiries`   | `{ name, email, phone, message, channel }`       |

### Properties — Broker/Admin
| Method | Endpoint                              | Notes                          |
|--------|---------------------------------------|--------------------------------|
| POST   | `/api/properties`                     | multipart/form-data with images |
| PATCH  | `/api/properties/:id`                 | multipart/form-data            |
| DELETE | `/api/properties/:id`                 | Soft delete (`isActive: false`) |
| DELETE | `/api/properties/:id/images/:publicId`| Deletes single image           |

### Broker
| Method | Endpoint                              | Notes                        |
|--------|---------------------------------------|------------------------------|
| GET    | `/api/broker/dashboard`               | Stats + recent data          |
| GET    | `/api/broker/properties`              | `page, limit, status`        |
| GET    | `/api/broker/inquiries`               | `page, limit, status`        |
| PATCH  | `/api/broker/inquiries/:id/status`    | `{ status: new|contacted|closed }` |

### Admin
| Method | Endpoint                    | Notes                         |
|--------|-----------------------------|-------------------------------|
| GET    | `/api/admin/analytics`      | Overview stats + charts data  |
| GET    | `/api/admin/brokers`        | `page, limit`                 |
| POST   | `/api/admin/brokers`        | `{ name, email, password, phone, whatsapp }` |
| PATCH  | `/api/admin/brokers/:id`    | `{ isActive }`                |
| DELETE | `/api/admin/brokers/:id`    | Hard delete                   |
| GET    | `/api/admin/inquiries`      | All system inquiries          |

---

## 🗂️ Project Structure

```
Hackthon/
├── backend/
│   ├── app.js                    # Express app setup, middleware, routes
│   ├── server.js                 # HTTP server + Socket.IO init + graceful shutdown
│   ├── uploads/properties/       # Uploaded property images (local disk)
│   └── src/
│       ├── config/
│       │   ├── db.js             # MongoDB Atlas connection
│       │   ├── cloudinary.js     # Cloudinary config (optional)
│       │   └── redis.js          # Redis config (optional, not active)
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── property.controller.js
│       │   ├── inquiry.controller.js  # ← emits Socket.IO on new inquiry
│       │   ├── broker.controller.js
│       │   └── admin.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js     # JWT verify + restrictTo(roles)
│       │   ├── validate.middleware.js # Joi validation
│       │   └── error.middleware.js    # Global error handler
│       ├── models/
│       │   ├── User.js                # roles: admin | broker
│       │   ├── Property.js            # 2dsphere index, text index
│       │   ├── Inquiry.js             # linked to property + broker
│       │   └── ImpressionLog.js       # daily view/listing counts
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── property.routes.js
│       │   ├── broker.routes.js
│       │   └── admin.routes.js
│       ├── services/
│       │   ├── property.service.js    # Search + cache logic
│       │   └── impression.service.js  # Buffer + flush scheduler
│       ├── socket.js                  # Socket.IO server (broker/admin rooms)
│       ├── utils/
│       │   ├── seed.js                # Seeds admin + 5 brokers
│       │   ├── seedProperties.js      # Seeds 142 properties
│       │   ├── seedKishan.js          # Seeds demo broker + 20 props + 60d analytics
│       │   ├── ApiError.js
│       │   ├── ApiResponse.js
│       │   └── asyncHandler.js
│       └── validators/
│           ├── property.validator.js
│           └── inquiry.validator.js
│
├── frontend/
│   ├── vite.config.js             # Proxy /api, /uploads, /socket.io → :5000
│   └── src/
│       ├── api/
│       │   ├── axios.js           # Axios instance with auth header
│       │   ├── auth.api.js
│       │   ├── property.api.js
│       │   ├── broker.api.js
│       │   └── admin.api.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx     # Role-aware nav (public/broker/admin)
│       │   │   └── Footer.jsx
│       │   ├── common/
│       │   │   ├── Modal.jsx
│       │   │   └── Loader.jsx
│       │   ├── dashboard/
│       │   │   └── StatCard.jsx
│       │   ├── property/
│       │   │   ├── PropertyCard.jsx
│       │   │   └── PropertyFilters.jsx
│       │   └── SocketProvider.jsx # Socket connect/disconnect + toast handler
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Properties.jsx
│       │   ├── PropertyDetail.jsx
│       │   ├── Login.jsx
│       │   ├── BrokerDashboard.jsx
│       │   ├── BrokerProperties.jsx
│       │   ├── AddEditProperty.jsx  # 4-step wizard
│       │   ├── BrokerInquiries.jsx
│       │   ├── BrokerProfile.jsx
│       │   └── AdminDashboard.jsx
│       ├── store/
│       │   ├── useAuthStore.js    # Zustand: token, user, login, logout
│       │   └── socketStore.js     # Zustand: socket instance + connect/disconnect
│       ├── data/
│       │   └── rajkotLocations.js # 110+ Rajkot locations for autocomplete
│       └── utils/
│           └── helpers.js         # formatDate, formatNumber, truncate, etc.
│
├── package.json                   # Root: install:all, dev:backend, dev:frontend, seed
└── README.md
```

---

## 🗄️ Database Design

**MongoDB Atlas** — `rentpro_db`

### Collections

#### `users`
```
_id, name, email (unique), password (bcrypt), role (admin|broker),
phone, whatsapp, isActive, lastLogin, createdAt
```

#### `properties`
```
_id, title, description, propertyType, status (available|rented|unavailable),
rent { amount, type (monthly|per-day), isNegotiable, deposit },
area { size, unit }, bedrooms, bathrooms, furnishing,
tenantType (any|family|bachelor), occupancy (any|boys|girls|coed),
amenities[], nearbyFacilities[],
location { address, locality, city, state, pincode,
  coordinates { type: "Point", coordinates: [lng, lat] } },
contact { whatsapp, email, phone },
images [{ url, publicId, isPrimary }],
broker (ref: User), tags[], isFeatured, isVerified, isActive,
mealsIncluded, availableFrom,
impressions { views, listings },   ← denormalized totals
createdAt, updatedAt

Indexes:
  - location.coordinates: 2dsphere
  - title + description + locality + tags: text (weighted)
  - broker + isActive: compound
  - status + isActive + rentAmount: compound
```

#### `inquiries`
```
_id, name, email, phone, message, channel (form|whatsapp|call),
status (new|contacted|closed),
property (ref: Property), broker (ref: User),
ipAddress, userAgent, createdAt

Indexes:
  - property + createdAt: compound
  - broker + status: compound
```

#### `impressionlogs`
```
_id, property (ref: Property), date (YYYY-MM-DD), views, listings

Index: property + date (unique) — one document per property per day
```

---

## 🏗️ Architecture Decisions

### Impression Buffering
Property views and listing appearances are buffered **in-memory** (60s flush cycle) rather than writing to MongoDB on every request. This prevents write amplification — a property appearing 1,000 times in search results generates one DB write per minute, not 1,000.

### In-Memory Caching (`node-cache`)
Property search queries are cached for 5 minutes. The cache is invalidated on every create/update/delete, ensuring freshness while dramatically reducing DB load during demos or high traffic.

### Role-Based Access Control (RBAC)
Every protected route uses `protect` (JWT verify) + `restrictTo(...roles)`. A broker cannot reach admin routes — the middleware returns 403 before the controller runs.

### Soft Deletes
Properties are never physically deleted (`isActive: false` instead). This preserves all inquiry history linked to a property, maintaining data integrity.

### Geospatial Search
MongoDB `2dsphere` index on `location.coordinates` (GeoJSON `Point`) supports:
- `$near` — find properties within a radius (km)
- `$geoWithin` — find properties within a polygon/box

### Weighted Text Search
MongoDB text index with custom weights:
- `title` → 10 (most important)
- `locality` → 8
- `tags` → 6
- `description` → 2 (least important)

This ensures a property titled "2BHK in Kalawad Road" ranks higher than one that merely mentions Kalawad in the description.

### Socket.IO — Graceful Optional
Socket.IO is initialized but the entire real-time layer is designed to fail silently:
- Backend `emitNewInquiry()` is wrapped in `try/catch` — inquiry creation never fails because of socket issues
- Frontend `socketStore.js` catches all connection errors
- Frontend `SocketProvider.jsx` degrades gracefully — the app works 100% without it

---

## 🌱 Demo Seed Data

| Dataset           | Count    | Command                                          |
|-------------------|----------|--------------------------------------------------|
| Admin account     | 1        | `npm run seed`                                   |
| Broker accounts   | 5        | `npm run seed`                                   |
| Properties        | 142      | `npm run seed:properties`                        |
| Demo broker props | 20       | `node backend/src/utils/seedKishan.js`           |
| Impression logs   | 1,220    | Included in above (60 days × 20 properties)      |

Seeded properties cover:
- All 10 property types
- All furnishing levels
- All tenant/occupancy types
- Monthly and per-day rent
- 25 Rajkot localities with realistic GPS coordinates
- Featured and non-featured listings
- Available and rented statuses

---

## 🔮 Potential Improvements

- **Redis** for distributed caching in multi-instance deployments
- **Razorpay / Stripe** for booking deposit payments
- **Email notifications** via Nodemailer when broker receives inquiry
- **AI property recommendations** — collaborative filtering based on browsing history
- **Admin property moderation** — approval workflow before listings go live
- **Property ranking score** — weighted formula (views + inquiries + recency)
- **S3 / Cloudflare R2** as scalable image storage alternative
- **Mobile app** using React Native with shared business logic
