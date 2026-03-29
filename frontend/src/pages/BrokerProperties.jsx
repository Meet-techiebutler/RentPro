import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { brokerApi } from '../api/broker.api';
import { propertyApi } from '../api/property.api';
import { PageLoader } from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, statusColors, propertyTypeLabel, getPrimaryImage } from '../utils/helpers';

export default function BrokerProperties() {
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-properties', statusFilter, page],
    queryFn: () => brokerApi.getMyProperties({ status: statusFilter || undefined, page, limit: 10 }).then((r) => r.data),
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

  if (isLoading) return <PageLoader />;

  const properties = data?.data?.properties || [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm mt-1">{meta?.total || 0} properties listed</p>
        </div>
        <Link to="/broker/properties/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card">
        <Filter className="w-4 h-4 text-gray-400 ml-1" />
        {['', 'available', 'rented', 'unavailable'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No properties yet</h3>
          <Link to="/broker/properties/new" className="btn-primary mt-4 inline-block">Add your first property</Link>
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
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getPrimaryImage(p.images)} alt={p.title} className="w-12 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate">{p.location?.city}</p>
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
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {p.impressions?.views || 0}
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
