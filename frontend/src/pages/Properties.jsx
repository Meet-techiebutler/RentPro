import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, MapPin, List, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyApi } from '../api/property.api';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import { GridSkeleton } from '../components/common/Loader';
import useDebounce from '../hooks/useDebounce';
import { formatCurrency } from '../utils/helpers';
import RAJKOT_LOCATIONS from '../data/rajkotLocations';

const LOC_ICON = { area: '📍', society: '🏘️', landmark: '🗺️' };

// Fly-to controller — must live inside <MapContainer>
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target?.center) map.flyTo(target.center, 16, { duration: 1 });
  }, [target]);
  return null;
}

// Custom marker icons
const defaultMarkerIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#2563eb;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.35)"></div>',
  iconSize: [18, 18], iconAnchor: [9, 9],
});
const selectedMarkerIcon = L.divIcon({
  className: '',
  html: '<div style="width:26px;height:26px;background:#dc2626;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(220,38,38,0.25),0 2px 8px rgba(0,0,0,0.35)"></div>',
  iconSize: [26, 26], iconAnchor: [13, 13],
});

export default function Properties() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggIdx, setActiveSuggIdx] = useState(-1);
  const searchInputRef = useRef(null);
  const searchDropRef  = useRef(null);

  const suggestions = searchInput.trim().length > 0
    ? RAJKOT_LOCATIONS.filter(l => l.name.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 7)
    : [];

  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);

  const [filters, setFilters] = useState({
    locality: searchParams.get('locality') || '',
    propertyType: searchParams.get('propertyType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    amenities: searchParams.get('amenities') || '',
    furnishing: searchParams.get('furnishing') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    rentType: searchParams.get('rentType') || '',
    tenantType: searchParams.get('tenantType') || '',
    occupancy: searchParams.get('occupancy') || '',
    isVerified: searchParams.get('isVerified') || '',
    mealsIncluded: searchParams.get('mealsIncluded') || '',
    availableNow: searchParams.get('availableNow') || '',
    status: 'available',
  });

  // Sync locality changes from URL (e.g. navbar location links)
  useEffect(() => {
    const loc = searchParams.get('locality') || '';
    if (loc) setFilters(f => ({ ...f, locality: loc }));
  }, [searchParams.get('locality')]);  // eslint-disable-line

  // Sync search to filters
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch }));
    setPage(1);
  }, [debouncedSearch]);

  const queryParams = { ...filters, page, limit: 12 };
  Object.keys(queryParams).forEach((k) => { if (!queryParams[k]) delete queryParams[k]; });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => propertyApi.getAll(queryParams).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const properties = data?.properties || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ locality: '', propertyType: '', minRent: '', maxRent: '', amenities: '', furnishing: '', bedrooms: '', rentType: '', tenantType: '', occupancy: '', isVerified: '', mealsIncluded: '', availableNow: '', status: 'available' });
    setSearchInput('');
    setPage(1);
    setSearchParams({});
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'status').length + (debouncedSearch ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Active filter chips */}
      {(filters.locality || filters.tenantType || filters.occupancy || filters.isVerified === 'true' || filters.mealsIncluded === 'true' || filters.availableNow === 'true') && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.locality && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200">
              <MapPin className="w-3 h-3" />{filters.locality}
              <button onClick={() => handleFilterChange('locality','')} className="ml-1 hover:text-primary-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.tenantType && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              {filters.tenantType === 'family' ? '👨‍👩‍👧' : '🎓'} {filters.tenantType}
              <button onClick={() => handleFilterChange('tenantType','')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.occupancy && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
              {filters.occupancy === 'boys' ? '👦' : filters.occupancy === 'girls' ? '👧' : '🤝'} {filters.occupancy}
              <button onClick={() => handleFilterChange('occupancy','')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.isVerified === 'true' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
              ✅ Verified only
              <button onClick={() => handleFilterChange('isVerified','')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.mealsIncluded === 'true' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
              🍽️ Meals included
              <button onClick={() => handleFilterChange('mealsIncluded','')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.availableNow === 'true' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
              🔑 Available now
              <button onClick={() => handleFilterChange('availableNow','')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative" ref={searchDropRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search locality, area, landmark in Rajkot..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); setActiveSuggIdx(-1); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;
              if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggIdx(i => Math.min(i + 1, suggestions.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggIdx(i => Math.max(i - 1, -1)); }
              else if (e.key === 'Enter' && activeSuggIdx >= 0) {
                e.preventDefault();
                const loc = suggestions[activeSuggIdx];
                setSearchInput(loc.name);
                setShowSuggestions(false);
                handleFilterChange('locality', loc.name);
              } else if (e.key === 'Escape') setShowSuggestions(false);
            }}
            className="input-field pl-10"
            autoComplete="off"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                {suggestions.map((loc, i) => (
                  <li key={loc.name}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchInput(loc.name);
                        setShowSuggestions(false);
                        handleFilterChange('locality', loc.name);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === activeSuggIdx ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base leading-none">{LOC_ICON[loc.type] || '📍'}</span>
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${showFilters ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'}`}>{activeFilterCount}</span>}
        </button>
        <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('map')} className={`p-2.5 transition-colors ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 280 }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
              style={{ width: 280 }}
            >
              <PropertyFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {isFetching ? 'Searching...' : (
                pagination ? <><span className="font-semibold text-gray-900">{pagination.total}</span> properties found</> : ''
              )}
            </p>
            <select
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="rent.amount">Price: Low to High</option>
              <option value="-rent.amount">Price: High to Low</option>
              <option value="-impressions.views">Most Viewed</option>
            </select>
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div id="properties-map" ref={mapRef} className="rounded-2xl overflow-hidden border border-gray-200 mb-6" style={{ height: 480 }}>
              <MapContainer
                center={flyTarget?.center || [22.3039, 70.8022]}
                zoom={flyTarget ? 16 : 12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <MapFlyTo target={flyTarget} />
                {properties.map((p) => {
                  const coords = p.location?.coordinates?.coordinates;
                  if (!coords || coords.length < 2) return null;
                  const isSelected = flyTarget?.id === p._id;
                  return (
                    <Marker
                      key={p._id}
                      position={[coords[1], coords[0]]}
                      icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
                      eventHandlers={{ click: () => setFlyTarget({ center: [coords[1], coords[0]], id: p._id }) }}
                    >
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                            />
                          )}
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 2 }}>{p.title}</p>
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#2563eb', marginBottom: 2 }}>
                            {formatCurrency(p.rent?.amount)}/{p.rent?.type === 'per-day' ? 'day' : 'mo'}
                          </p>
                          {p.location?.locality && (
                            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>📍 {p.location.locality}</p>
                          )}
                          <a
                            href={`/properties/${p._id}`}
                            style={{
                              display: 'block', textAlign: 'center', background: '#2563eb',
                              color: '#fff', borderRadius: 6, padding: '6px 12px',
                              fontSize: 12, fontWeight: 600, textDecoration: 'none',
                            }}
                            onClick={(e) => { e.preventDefault(); navigate(`/properties/${p._id}`); }}
                          >
                            View Property →
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

          {/* Grid View */}
          {isLoading ? (
            <GridSkeleton count={6} />
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No properties found</h3>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-secondary text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {properties.map((p, i) => {
                const coords = p.location?.coordinates?.coordinates;
                const hasCoords = coords && coords.length >= 2;
                const isSelected = flyTarget?.id === p._id;
                return (
                  <div key={p._id} className={`relative group rounded-2xl transition-all duration-200 ${isSelected && viewMode === 'map' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
                    <PropertyCard property={p} index={i} />
                    {viewMode === 'map' && hasCoords && (
                      <button
                        onClick={() => {
                          setFlyTarget({ center: [coords[1], coords[0]], id: p._id });
                          document.getElementById('properties-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        title="Show on map"
                        className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg transition-all z-10 ${
                          isSelected
                            ? 'bg-red-500 text-white opacity-100'
                            : 'bg-white/90 backdrop-blur-sm text-primary-700 border border-primary-200 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        {isSelected ? 'Shown' : 'Show on map'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Previous</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'}`}
                >
                  {p}
                </button>
              ))}
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <AnimatePresence>
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-4">
                <PropertyFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
