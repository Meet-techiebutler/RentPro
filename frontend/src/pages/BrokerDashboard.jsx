import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Eye, MessageSquare, TrendingUp, Plus, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { brokerApi } from '../api/broker.api';
import StatCard from '../components/dashboard/StatCard';
import ImpressionChart from '../components/dashboard/ImpressionChart';
import { PageLoader } from '../components/common/Loader';
import { formatCurrency, formatDate, statusColors, inquiryStatusColors, getPrimaryImage, truncate } from '../utils/helpers';
import useAuthStore from '../store/useAuthStore';

export default function BrokerDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-dashboard'],
    queryFn: () => brokerApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader />;

  const { stats = {}, recentProperties = [], recentInquiries = [], impressionTrend = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's an overview of your listings</p>
        </div>
        <Link to="/broker/properties/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Properties" value={stats.totalProperties || 0} icon={Building2} color="primary" index={0} />
        <StatCard title="Available" value={stats.availableProperties || 0} icon={CheckCircle} color="green" index={1} />
        <StatCard title="Total Views" value={stats.totalViews || 0} icon={Eye} color="blue" index={2} />
        <StatCard title="New Inquiries" value={stats.newInquiries || 0} icon={MessageSquare} color="orange" index={3} />
      </div>

      {/* Impression Chart */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Impressions (Last 30 Days)</h3>
            <p className="text-sm text-gray-500 mt-0.5">Views & listing appearances</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span>{stats.totalListings || 0} listings</span>
          </div>
        </div>
        <ImpressionChart data={impressionTrend} />
      </div>

      {/* Recent Properties & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Properties</h3>
            <Link to="/broker/properties" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No properties yet</p>
              <Link to="/broker/properties/new" className="btn-primary mt-3 inline-block text-sm">Add First Property</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img src={getPrimaryImage(p.images)} alt={p.title} className="w-14 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(p.rent?.amount)}/mo</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge text-xs ${statusColors[p.status]}`}>{p.status}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="w-3 h-3" /> {p.impressions?.views || 0}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
            <Link to="/broker/inquiries" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq, i) => (
                <motion.div
                  key={inq._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-700 font-bold text-xs">{inq.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{inq.name}</p>
                      <span className={`badge text-xs ${inquiryStatusColors[inq.status]}`}>{inq.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{truncate(inq.message, 60)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(inq.createdAt)}
                      {inq.property && <span className="ml-1 truncate">• {inq.property.title}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
