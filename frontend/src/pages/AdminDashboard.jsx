import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Users, Eye, MessageSquare, TrendingUp, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Shield, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi } from '../api/admin.api';
import StatCard from '../components/dashboard/StatCard';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/Loader';
import { formatDate, formatNumber } from '../utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [createModal, setCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [brokerForm, setBrokerForm] = useState({ name: '', email: '', password: '', phone: '', whatsapp: '' });
  const [brokerPage, setBrokerPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics().then(r => r.data.data),
    refetchInterval: 120_000,
  });

  const { data: brokersData, isLoading: loadingBrokers } = useQuery({
    queryKey: ['admin-brokers', brokerPage],
    queryFn: () => adminApi.getBrokers({ page: brokerPage, limit: 10 }).then(r => r.data),
    enabled: activeTab === 'brokers',
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createBroker(data),
    onSuccess: () => {
      toast.success('Broker created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-brokers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      setCreateModal(false);
      setBrokerForm({ name: '', email: '', password: '', phone: '', whatsapp: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create broker'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminApi.updateBroker(id, { isActive }),
    onSuccess: () => {
      toast.success('Broker status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-brokers'] });
    },
    onError: () => toast.error('Failed to update broker'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteBroker(id),
    onSuccess: () => {
      toast.success('Broker deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-brokers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete broker'),
  });

  if (loadingAnalytics) return <PageLoader />;

  const { overview = {}, propertyTypeStats = [], topBrokers = [], recentInquiries = [] } = analytics || {};
  const brokers = brokersData?.data?.brokers || [];
  const brokerMeta = brokersData?.meta;

  const pieData = propertyTypeStats.map(s => ({ name: s._id, value: s.count }));

  const TABS = ['overview', 'brokers', 'inquiries'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Full system control & analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl shadow-card p-1 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Brokers" value={overview.totalBrokers || 0} icon={Users} color="purple" index={0} />
            <StatCard title="Active Brokers" value={overview.activeBrokers || 0} icon={TrendingUp} color="green" index={1} />
            <StatCard title="Total Properties" value={overview.totalProperties || 0} icon={Building2} color="primary" index={2} />
            <StatCard title="Total Inquiries" value={overview.totalInquiries || 0} icon={MessageSquare} color="orange" index={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Views" value={overview.totalViews || 0} icon={Eye} color="blue" index={4} />
            <StatCard title="Available Properties" value={overview.availableProperties || 0} icon={Building2} color="green" index={5} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Type Distribution */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Property Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [formatNumber(v), 'Properties']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-10">No data</p>}
            </div>

            {/* Top Brokers */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Top Brokers by Views</h3>
              <div className="space-y-3">
                {topBrokers.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No broker data yet</p>
                ) : topBrokers.map((b, i) => (
                  <div key={b._id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-xs">{b.broker?.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.broker?.name}</p>
                      <p className="text-xs text-gray-400">{b.propertyCount} properties</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-3.5 h-3.5 text-primary-400" />
                      {formatNumber(b.totalViews)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Inquiries</h3>
            {recentInquiries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No inquiries yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-500 pb-3 font-semibold">Name</th>
                      <th className="text-left text-xs text-gray-500 pb-3 font-semibold hidden sm:table-cell">Property</th>
                      <th className="text-left text-xs text-gray-500 pb-3 font-semibold hidden md:table-cell">Broker</th>
                      <th className="text-left text-xs text-gray-500 pb-3 font-semibold">Date</th>
                      <th className="text-left text-xs text-gray-500 pb-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentInquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{inq.name}</td>
                        <td className="py-3 text-gray-500 hidden sm:table-cell truncate max-w-[180px]">{inq.property?.title}</td>
                        <td className="py-3 text-gray-500 hidden md:table-cell">{inq.broker?.name}</td>
                        <td className="py-3 text-gray-400 text-xs">{formatDate(inq.createdAt)}</td>
                        <td className="py-3">
                          {inq.property?._id && (
                            <Link to={`/properties/${inq.property._id}`} target="_blank" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                              <ExternalLink className="w-3 h-3" /> View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BROKERS TAB ── */}
      {activeTab === 'brokers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Broker
            </button>
          </div>

          {loadingBrokers ? <PageLoader /> : (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Broker</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Properties</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Joined</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {brokers.map((b, i) => (
                      <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-700 font-bold text-sm">{b.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                              <p className="text-xs text-gray-500">{b.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-600">{b.propertyCount || 0}</td>
                        <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-500">{formatDate(b.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`badge text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {b.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleMutation.mutate({ id: b._id, isActive: !b.isActive })}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title={b.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {b.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setDeleteTarget(b)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {brokerMeta && brokerMeta.pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                  <button disabled={brokerPage <= 1} onClick={() => setBrokerPage(p => p - 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Prev</button>
                  <span className="text-sm text-gray-600">{brokerPage} of {brokerMeta.pages}</span>
                  <button disabled={brokerPage >= brokerMeta.pages} onClick={() => setBrokerPage(p => p + 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── INQUIRIES TAB ── */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">All System Inquiries</h3>
          <p className="text-sm text-gray-400">System-wide inquiry log. Brokers manage their own leads.</p>
          <div className="mt-4 space-y-3">
            {recentInquiries.map((inq, i) => (
              <div key={inq._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-xs">{inq.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{inq.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {inq.property?.title
                      ? <Link to={`/properties/${inq.property._id}`} target="_blank" className="text-primary-600 hover:underline font-medium">{inq.property.title}</Link>
                      : 'Unknown property'}
                    {inq.broker?.name && <span> • {inq.broker.name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(inq.createdAt)}</span>
                  {inq.property?._id && (
                    <Link to={`/properties/${inq.property._id}`} target="_blank"
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Property">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Broker Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Broker" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
              <input value={brokerForm.name} onChange={e => setBrokerForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
              <input type="email" value={brokerForm.email} onChange={e => setBrokerForm(f => ({ ...f, email: e.target.value }))} placeholder="broker@email.com" className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Password * (min 8 chars)</label>
            <input type="password" value={brokerForm.password} onChange={e => setBrokerForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="input-field text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone</label>
              <input value={brokerForm.phone} onChange={e => setBrokerForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">WhatsApp</label>
              <input value={brokerForm.whatsapp} onChange={e => setBrokerForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+91 98765 43210" className="input-field text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => createMutation.mutate(brokerForm)} disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? 'Creating...' : 'Create Broker'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Broker" size="sm">
        <p className="text-gray-600 text-sm mb-6">Delete broker <span className="font-semibold">"{deleteTarget?.name}"</span>? All their properties will be deactivated.</p>
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
