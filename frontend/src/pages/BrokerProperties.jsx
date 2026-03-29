import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Building2, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { brokerApi } from '../api/broker.api';
import { propertyApi } from '../api/property.api';
import { PageLoader } from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, statusColors, propertyTypeLabel, getPrimaryImage } from '../utils/helpers';

const PROPERTY_TYPES = ['flat','tenement','villa','studio','duplex','penthouse','bungalow','farmhouse','commercial','pg'];
const FURNISHING_OPTS = [{ value: 'unfurnished', label: 'Unfurnished' }, { value: 'semi-furnished', label: 'Semi-Furnished' }, { value: 'fully-furnished', label: 'Fully Furnished' }];
const TENANT_OPTS     = [{ value: 'any', label: 'Any' }, { value: 'family', label: 'Family Only' }, { value: 'bachelor', label: 'Bachelor OK' }];
const OCCUPANCY_OPTS  = [{ value: 'any', label: 'Any' }, { value: 'boys', label: 'Boys' }, { value: 'girls', label: 'Girls' }, { value: 'coed', label: 'Co-ed' }];
const SORT_OPTS       = [{ value: '-createdAt', label: 'Newest First' }, { value: 'createdAt', label: 'Oldest First' }, { value: 'rent.amount', label: 'Rent: Low → High' }, { value: '-rent.amount', label: 'Rent: High → Low' }, { value: '-impressions.views', label: 'Most Viewed' }];
const RENT_PRESETS    = [{ label: '< ₹5k', max: 5000 }, { label: '₹5k–10k', min: 5000, max: 10000 }, { label: '₹10k–20k', min: 10000, max: 20000 }, { label: '₹20k–40k', min: 20000, max: 40000 }, { label: '> ₹40k', min: 40000 }];

const defaultFilters = { q: '', status: '', propertyType: '', furnishing: '', tenantType: '', occupancy: '', rentType: '', minRent: '', maxRent: '', sort: '-createdAt' };

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
    </span>
  );
}

export default function BrokerProperties() {
  const [filters, setFilters] = useState(defaultFilters);
  const [applied, setApplied]   = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const searchTimeout = useRef(null);
  const queryClient = useQueryClient();

  // Debounce search field
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setApplied(f => ({ ...f, q: filters.q }));
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [filters.q]);

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); setShowFilters(false); };
  const clearFilters = () => { setFilters(defaultFilters); setApplied(defaultFilters); setPage(1); };
  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const params = {
    page, limit: 10,
    ...(applied.q           && { q:           applied.q }),
    ...(applied.status      && { status:       applied.status }),
    ...(applied.propertyType && { propertyType: applied.propertyType }),
    ...(applied.furnishing  && { furnishing:   applied.furnishing }),
    ...(applied.tenantType  && { tenantType:   applied.tenantType }),
    ...(applied.occupancy   && { occupancy:    applied.occupancy }),
    ...(applied.rentType    && { rentType:     applied.rentType }),
    ...(applied.minRent     && { minRent:      applied.minRent }),
    ...(applied.maxRent     && { maxRent:      applied.maxRent }),
    sort: applied.sort,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['broker-properties', params],
    queryFn: () => brokerApi.getMyProperties(params).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyApi.delete(id),
    onSuccess: () => {
      toast.success('Property deleted');
      queryClient.invalidateQueries({ queryKey: ['broker-properties'] });
      queryClient.invalidateQueries({ queryKey: ['broker-dashboard'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete property'),
  });

  const properties = data?.data?.properties || [];
  const meta = data?.meta;

  // Active filter chips (all except sort & q which are shown differently)
  const activeChips = [
    applied.status       && { key: 'status',       label: applied.status.charAt(0).toUpperCase() + applied.status.slice(1) },
    applied.propertyType && { key: 'propertyType', label: propertyTypeLabel[applied.propertyType] || applied.propertyType },
    applied.furnishing   && { key: 'furnishing',   label: FURNISHING_OPTS.find(f => f.value === applied.furnishing)?.label },
    applied.tenantType   && { key: 'tenantType',   label: TENANT_OPTS.find(f => f.value === applied.tenantType)?.label },
    applied.occupancy    && { key: 'occupancy',    label: OCCUPANCY_OPTS.find(f => f.value === applied.occupancy)?.label },
    applied.rentType     && { key: 'rentType',     label: applied.rentType === 'per-day' ? 'Per Day' : 'Monthly' },
    (applied.minRent || applied.maxRent) && { key: 'rent', label: `₹${applied.minRent || 0}–${applied.maxRent || '∞'}` },
  ].filter(Boolean);

  const hasFilters = activeChips.length > 0 || applied.q;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm mt-1">{meta?.total ?? '—'} properties{hasFilters ? ' (filtered)' : ' listed'}</p>
        </div>
        <Link to="/broker/properties/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* ── Search + Filter toggle bar ── */}
      <div className="bg-white rounded-2xl shadow-card p-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.q}
              onChange={e => setF('q', e.target.value)}
              placeholder="Search by title, locality, tags…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            {filters.q && (
              <button onClick={() => setF('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort inline */}
          <select
            value={filters.sort}
            onChange={e => { setF('sort', e.target.value); setApplied(f => ({ ...f, sort: e.target.value })); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 hidden sm:block"
          >
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Toggle filters panel */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeChips.length > 0 ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeChips.length > 0 && <span className="w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeChips.length}</span>}
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Status tabs (always visible) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['', 'available', 'rented', 'unavailable'].map(s => (
            <button
              key={s}
              onClick={() => { setF('status', s); setApplied(f => ({ ...f, status: s })); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filters.status === s ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeChips.map(chip => (
              <FilterChip key={chip.key} label={chip.label} onRemove={() => {
                const next = { ...filters, ...(chip.key === 'rent' ? { minRent: '', maxRent: '' } : { [chip.key]: '' }) };
                setFilters(next);
                setApplied(a => ({ ...a, ...(chip.key === 'rent' ? { minRent: '', maxRent: '' } : { [chip.key]: '' }) }));
                setPage(1);
              }} />
            ))}
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 underline ml-1">Clear all</button>
          </div>
        )}

        {/* ── Expandable full filter panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Property Type */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Property Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPERTY_TYPES.map(t => (
                      <button key={t} onClick={() => setF('propertyType', filters.propertyType === t ? '' : t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.propertyType === t ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                        {propertyTypeLabel[t] || t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Furnishing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FURNISHING_OPTS.map(o => (
                      <button key={o.value} onClick={() => setF('furnishing', filters.furnishing === o.value ? '' : o.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.furnishing === o.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rent Type */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rent Type</p>
                  <div className="flex gap-1.5">
                    {[{ value: '', label: 'Any' }, { value: 'monthly', label: 'Monthly' }, { value: 'per-day', label: 'Per Day' }].map(o => (
                      <button key={o.value} onClick={() => setF('rentType', filters.rentType === o.value ? '' : o.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.rentType === o.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Tenant */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preferred Tenant</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TENANT_OPTS.map(o => (
                      <button key={o.value} onClick={() => setF('tenantType', filters.tenantType === o.value ? '' : o.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.tenantType === o.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occupancy */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Occupancy</p>
                  <div className="flex flex-wrap gap-1.5">
                    {OCCUPANCY_OPTS.map(o => (
                      <button key={o.value} onClick={() => setF('occupancy', filters.occupancy === o.value ? '' : o.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.occupancy === o.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rent Range */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rent Range (₹)</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {RENT_PRESETS.map(preset => {
                      const active = String(filters.minRent || '') === String(preset.min || '') && String(filters.maxRent || '') === String(preset.max || '');
                      return (
                        <button key={preset.label}
                          onClick={() => { setF('minRent', active ? '' : String(preset.min || '')); setF('maxRent', active ? '' : String(preset.max || '')); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min ₹" value={filters.minRent} onChange={e => setF('minRent', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    <span className="text-gray-400 text-xs">–</span>
                    <input type="number" placeholder="Max ₹" value={filters.maxRent} onChange={e => setF('maxRent', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                </div>

                {/* Sort (mobile) */}
                <div className="sm:hidden">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</p>
                  <select value={filters.sort} onChange={e => setF('sort', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

              </div>

              {/* Apply / Clear */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Clear all</button>
                <button onClick={applyFilters} className="btn-primary text-sm px-5 py-2">Apply Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Properties Table */}
      {isLoading ? (
        <PageLoader />
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">{hasFilters ? 'No matching properties' : 'No properties yet'}</h3>
          {hasFilters
            ? <button onClick={clearFilters} className="btn-secondary mt-4">Clear Filters</button>
            : <Link to="/broker/properties/new" className="btn-primary mt-4 inline-block">Add your first property</Link>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Property</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Rent</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Views</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Added</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getPrimaryImage(p.images)} alt={p.title} className="w-12 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate">{p.location?.locality || p.location?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{propertyTypeLabel[p.propertyType] || p.propertyType}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-primary-600">{formatCurrency(p.rent?.amount)}</span>
                      <span className="text-xs text-gray-400">/{p.rent?.type === 'per-day' ? 'day' : 'mo'}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`badge text-xs ${statusColors[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-3.5 h-3.5 text-gray-400" /> {p.impressions?.views || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/properties/${p._id}`} target="_blank" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/broker/properties/${p._id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-600">{page} of {meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Property" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete <span className="font-semibold">"{deleteTarget?.title}"</span>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending} className="btn-danger flex-1">
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
