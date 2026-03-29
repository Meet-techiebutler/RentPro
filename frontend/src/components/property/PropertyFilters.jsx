import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROPERTY_TYPES = ['flat', 'tenement', 'villa', 'studio', 'duplex', 'penthouse', 'bungalow', 'pg', 'commercial'];
const FURNISHING_TYPES = ['unfurnished', 'semi-furnished', 'fully-furnished'];

const TENANT_TYPES = [
  { value: '', label: 'All', icon: '🏠' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'bachelor', label: 'Bachelor', icon: '🎓' },
];

const OCCUPANCY_TYPES = [
  { value: '', label: 'Any', icon: '👥' },
  { value: 'boys', label: 'Boys Only', icon: '👦' },
  { value: 'girls', label: 'Girls Only', icon: '👧' },
  { value: 'coed', label: 'Co-ed', icon: '🤝' },
];

const RENT_PRESETS = [
  { label: 'Under ₹4K', min: '', max: '4000' },
  { label: '₹4K–₹6K', min: '4000', max: '6000' },
  { label: '₹6K–₹8K', min: '6000', max: '8000' },
  { label: '₹8K+', min: '8000', max: '' },
];

const RAJKOT_LOCALITIES = [
  'Kalawad Road', 'University Road', '150 Ft Ring Road', 'Mavdi',
  'Gondal Road', 'Bhaktinagar', 'Race Course Road', 'Raiya Road',
  'Tagore Road', 'Airport Road', 'Nanamava', 'Malviya Nagar',
];

const AMENITY_LIST = [
  { key: 'wifi',           icon: '📶', label: 'Wi-Fi' },
  { key: 'meals-included', icon: '�️', label: 'Meals Included' },
  { key: 'ac',             icon: '❄️', label: 'AC' },
  { key: 'laundry',        icon: '🧺', label: 'Laundry' },
  { key: 'parking',        icon: '🅿️', label: 'Parking' },
  { key: 'gym',            icon: '🏋️', label: 'Gym' },
  { key: 'cctv',           icon: '�', label: 'CCTV' },
  { key: 'security',       icon: '🔒', label: 'Security' },
  { key: 'power-backup',   icon: '⚡', label: 'Power Backup' },
  { key: 'lift',           icon: '�', label: 'Lift' },
  { key: 'swimming-pool',  icon: '🏊', label: 'Swimming Pool' },
  { key: 'garden',         icon: '🌿', label: 'Garden' },
];

const lbl = (s) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PropertyFilters({ filters, onChange, onClear }) {
  const activeCount = Object.entries(filters).filter(([k, v]) => v && v !== '' && k !== 'status').length;

  const toggle = (key, value) => {
    const current = filters[key] ? filters[key].split(',') : [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange(key, updated.length ? updated.join(',') : '');
  };

  const isSelected = (key, value) => filters[key]?.split(',').includes(value);

  const setRentPreset = (preset) => {
    onChange('minRent', preset.min);
    onChange('maxRent', preset.max);
  };

  const activePreset = RENT_PRESETS.find(p => p.min === (filters.minRent || '') && p.max === (filters.maxRent || ''));

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Refine Search</h3>
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* ── Monthly Rent ── */}
      <Section title="Monthly Rent (₹)">
        {/* Quick presets */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {RENT_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => activePreset?.label === p.label ? (onChange('minRent',''), onChange('maxRent','')) : setRentPreset(p)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activePreset?.label === p.label
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Custom range */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" placeholder="Min" value={filters.minRent || ''}
            onChange={(e) => onChange('minRent', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="number" placeholder="Max" value={filters.maxRent || ''}
            onChange={(e) => onChange('maxRent', e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </Section>

      {/* ── Preferred Occupancy ── */}
      <Section title="Preferred Occupancy">
        <div className="grid grid-cols-2 gap-2">
          {OCCUPANCY_TYPES.map(({ value, label: lbl2, icon }) => (
            <button
              key={value}
              onClick={() => onChange('occupancy', (filters.occupancy ?? '') === value ? '' : value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                (filters.occupancy ?? '') === value
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{icon}</span> {lbl2}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Who Can Stay ── */}
      <Section title="Who Can Stay">
        <div className="flex gap-2">
          {TENANT_TYPES.map(({ value, label: lbl3, icon }) => (
            <button
              key={value}
              onClick={() => onChange('tenantType', (filters.tenantType ?? '') === value ? '' : value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                (filters.tenantType ?? '') === value
                  ? value === 'family' ? 'bg-green-50 border-green-500 text-green-700'
                  : value === 'bachelor' ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-base">{icon}</span>
              {lbl3}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Location ── */}
      <Section title="Location">
        <div className="flex flex-wrap gap-1.5">
          {RAJKOT_LOCALITIES.map((loc) => (
            <button
              key={loc}
              onClick={() => onChange('locality', filters.locality === loc ? '' : loc)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                filters.locality === loc
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-400'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Property Type ── */}
      <Section title="Property Type">
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggle('propertyType', t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected('propertyType', t)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              {lbl(t)}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Furnishing ── */}
      <Section title="Furnishing" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {FURNISHING_TYPES.map((f) => (
            <button key={f} onClick={() => toggle('furnishing', f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected('furnishing', f) ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >{lbl(f)}</button>
          ))}
        </div>
      </Section>

      {/* ── Bedrooms ── */}
      <Section title="Bedrooms" defaultOpen={false}>
        <div className="flex gap-2">
          {['1','2','3','4'].map((n) => (
            <button key={n} onClick={() => onChange('bedrooms', filters.bedrooms === n ? '' : n)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-all ${
                filters.bedrooms === n ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary-300'
              }`}
            >{n}+</button>
          ))}
        </div>
      </Section>

      {/* ── Facilities & Amenities ── */}
      <Section title="Facilities & Amenities" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-y-2">
          {AMENITY_LIST.map(({ key, icon, label: amenLabel }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                isSelected('amenities', key) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-400'
              }`} onClick={() => toggle('amenities', key)}>
                {isSelected('amenities', key) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-gray-700">{icon} {amenLabel}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Additional Preferences ── */}
      <Section title="Additional Preferences" defaultOpen={false}>
        <div className="space-y-2.5">
          {[
            { key: 'isVerified',    icon: '✅', label: 'Verified Listings Only' },
            { key: 'mealsIncluded', icon: '🍽️', label: 'Meals Included' },
            { key: 'availableNow',  icon: '🔑', label: 'Available Immediately' },
          ].map(({ key, icon, label: prefLabel }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters[key] === 'true'}
                onChange={(e) => onChange(key, e.target.checked ? 'true' : '')}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">{icon} {prefLabel}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
