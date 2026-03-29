import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Building2, Shield, Star, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyApi } from '../api/property.api';
import PropertyCard from '../components/property/PropertyCard';
import { GridSkeleton } from '../components/common/Loader';
import RAJKOT_LOCATIONS from '../data/rajkotLocations';
import BrokerCharacter from '../components/BrokerCharacter';

const PROPERTY_TYPES = [
  { label: 'Flat', value: 'flat', icon: '🏢' },
  { label: 'Villa', value: 'villa', icon: '🏡' },
  { label: 'Studio', value: 'studio', icon: '🛋️' },
  { label: 'PG', value: 'pg', icon: '🏠' },
  { label: 'Duplex', value: 'duplex', icon: '🏘️' },
  { label: 'Commercial', value: 'commercial', icon: '🏬' },
];

const STATS = [
  { label: 'Properties Listed', value: '10,000+', icon: Building2, color: 'primary' },
  { label: 'Happy Tenants', value: '25,000+', icon: Star, color: 'orange' },
  { label: 'Verified Brokers', value: '500+', icon: Shield, color: 'green' },
  { label: 'Cities Covered', value: '50+', icon: MapPin, color: 'purple' },
];

const TYPE_ICON = { area: '📍', society: '🏘️', landmark: '🗺️' };

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggIndex, setActiveSuggIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertyApi.getFeatured().then((r) => r.data.data.properties),
  });

  // Filter suggestions based on input
  const suggestions = searchQuery.trim().length > 0
    ? RAJKOT_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveSuggIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    navigate(`/properties?${params.toString()}`);
  };

  const handleSelectSuggestion = (loc) => {
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    setActiveSuggIndex(-1);
    navigate(`/properties?locality=${encodeURIComponent(loc.name)}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeSuggIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleTypeClick = (type) => navigate(`/properties?propertyType=${type}`);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background property image */}
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/88 via-primary-800/80 to-primary-700/70" />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        {/* Floating property cards — decorative */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden xl:block absolute top-12 left-8 w-52 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        >
          <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=70" alt="" className="w-full h-28 object-cover" />
          <div className="p-3">
            <p className="text-white text-xs font-semibold">Modern 3BHK Villa</p>
            <p className="text-yellow-300 text-xs font-bold mt-0.5">₹45,000/mo</p>
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="hidden xl:block absolute bottom-16 left-12 w-44 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        >
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70" alt="" className="w-full h-24 object-cover" />
          <div className="p-3">
            <p className="text-white text-xs font-semibold">Studio Apartment</p>
            <p className="text-yellow-300 text-xs font-bold mt-0.5">₹12,000/mo</p>
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="hidden xl:block absolute top-16 right-8 w-52 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        >
          <img src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=70" alt="" className="w-full h-28 object-cover" />
          <div className="p-3">
            <p className="text-white text-xs font-semibold">Luxury Penthouse</p>
            <p className="text-yellow-300 text-xs font-bold mt-0.5">₹85,000/mo</p>
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
          className="hidden xl:block absolute bottom-20 right-10 w-44 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        >
          <img src="https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=400&q=70" alt="" className="w-full h-24 object-cover" />
          <div className="p-3">
            <p className="text-white text-xs font-semibold">PG for Boys</p>
            <p className="text-yellow-300 text-xs font-bold mt-0.5">₹8,000/mo</p>
          </div>
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-white/20">
              🏡 India's trusted rental platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Find Your Perfect
              <span className="block text-yellow-300">Rental Home</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Search thousands of verified properties across India. From flats to villas, find what suits your life.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex-1 relative" ref={dropdownRef}>
                <div className="flex items-center gap-2 px-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search locality, area, landmark in Rajkot..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); setActiveSuggIndex(-1); }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(''); setShowSuggestions(false); inputRef.current?.focus(); }}
                      className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {suggestions.map((loc, i) => (
                        <li key={loc.name}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(loc); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                              i === activeSuggIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-base leading-none">{TYPE_ICON[loc.type] || '📍'}</span>
                            <div>
                              <span className="font-medium">{loc.name}</span>
                              <span className="text-xs text-gray-400 ml-2 capitalize">{loc.type}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animated Broker Showcase ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100 py-16">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply opacity-20 blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — broker character + floating decorations */}
            <div className="flex items-center justify-center relative min-h-[420px]">
              {/* Floating emoji decorations */}
              <motion.div animate={{ y: [0,-18,0], rotate:[0,12,0] }} transition={{ duration:3,   repeat:Infinity, ease:'easeInOut'           }} className="absolute top-4   right-10 text-4xl z-10">🔑</motion.div>
              <motion.div animate={{ y: [0, 14,0], rotate:[0,-9,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:0.8 }} className="absolute top-10  left-6  text-3xl z-10">⭐</motion.div>
              <motion.div animate={{ y: [0,-11,0]                  }} transition={{ duration:4,   repeat:Infinity, ease:'easeInOut', delay:1.5 }} className="absolute bottom-20 right-6  text-3xl z-10">🏠</motion.div>
              <motion.div animate={{ y: [0, 16,0], rotate:[0,18,0] }} transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:0.4 }} className="absolute bottom-10 left-10 text-2xl z-10">💫</motion.div>
              <motion.div animate={{ y: [0,-14,0], rotate:[0,-8,0] }} transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut', delay:2   }} className="absolute top-1/2  left-2  text-2xl z-10">📋</motion.div>

              {/* Glowing circle behind character */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary-200 rounded-full opacity-25 blur-2xl" />
              </div>

              <BrokerCharacter />
            </div>

            {/* Right — How It Works */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                  How It Works
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  Your Personal<br />
                  <span className="text-primary-600">Property Guide</span>
                </h2>
                <p className="text-gray-500 mb-8 text-base">
                  Finding your perfect rental is just 3 easy steps away.
                </p>

                <div className="space-y-4">
                  {[
                    { step:'01', icon:'🔍', color:'bg-blue-50  border-blue-100',  title:'Search & Filter',  desc:'Use smart filters — type, locality, furnishing, rent range — to pinpoint exactly what you need.' },
                    { step:'02', icon:'📩', color:'bg-green-50 border-green-100', title:'Send Inquiry',     desc:'Connect directly with verified brokers via form, WhatsApp, or call. Zero middlemen.' },
                    { step:'03', icon:'🏠', color:'bg-amber-50  border-amber-100', title:'Move In!',         desc:'Visit the property, finalize with the broker, and settle into your dream rental.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.14, duration: 0.45 }}
                      whileHover={{ x: 4 }}
                      className={`flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border ${item.color} hover:shadow-md transition-all`}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-primary-400 tracking-widest">STEP {item.step}</span>
                          <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary-200 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <motion.button
                    onClick={() => navigate('/properties')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Start Searching <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <p className="text-xs text-gray-400">No registration needed to browse</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Browse by Type</h2>
            <p className="section-subtitle">Find the perfect property category for you</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PROPERTY_TYPES.map((type, i) => (
            <motion.button
              key={type.value}
              onClick={() => handleTypeClick(type.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 hover:border-primary-200 transition-all"
            >
              <span className="text-3xl">{type.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Properties</h2>
            <p className="section-subtitle">Handpicked premium listings just for you</p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="hidden sm:flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:gap-2.5 transition-all"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : featuredData?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.slice(0, 6).map((p, i) => (
              <PropertyCard key={p._id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No featured properties yet. Check back soon!</p>
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={() => navigate('/properties')} className="btn-primary inline-flex items-center gap-2">
            Browse All Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Why RentPro */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Why Choose RentPro?</h2>
            <p className="text-gray-400 mt-2">Built for tenants and brokers alike</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Geo-based search, filters by amenities, price, type & more.' },
              { icon: '✅', title: 'Verified Listings', desc: 'Every property listed by verified, professional brokers.' },
              { icon: '💬', title: 'Instant Contact', desc: 'WhatsApp, email, or form — connect with brokers instantly.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
