import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Mail, MessageCircle, Clock, ChevronDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { brokerApi } from '../api/broker.api';
import { PageLoader } from '../components/common/Loader';
import { formatDate, inquiryStatusColors, getWhatsAppLink, truncate } from '../utils/helpers';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

export default function BrokerInquiries() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-inquiries', statusFilter, page],
    queryFn: () => brokerApi.getInquiries({ status: statusFilter || undefined, page, limit: 15 }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => brokerApi.updateInquiryStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['broker-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['broker-dashboard'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <PageLoader />;

  const inquiries = data?.data?.inquiries || [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{meta?.total || 0} total inquiries</p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 bg-white rounded-2xl shadow-card p-3 overflow-x-auto">
        {['', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      {inquiries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No inquiries yet</h3>
          <p className="text-gray-400 text-sm mt-1">Inquiries from interested tenants will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq, i) => (
            <motion.div
              key={inq._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl shadow-card overflow-hidden"
            >
              {/* Header Row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === inq._id ? null : inq._id)}
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold">{inq.name?.charAt(0).toUpperCase()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{inq.name}</p>
                    <span className={`badge text-xs ${inquiryStatusColors[inq.status]}`}>{inq.status}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{inq.channel}</span>
                  </div>
                  {inq.property && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      Re: <Link
                        to={`/properties/${inq.property._id}`}
                        target="_blank"
                        className="text-primary-600 hover:underline inline-flex items-center gap-0.5"
                        onClick={e => e.stopPropagation()}
                      >
                        {inq.property.title}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{truncate(inq.message, 80)}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(inq.createdAt)}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === inq._id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === inq._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-100 p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact</p>
                      <div className="space-y-2">
                        {inq.phone && (
                          <a href={`tel:${inq.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                            <Phone className="w-3.5 h-3.5" /> {inq.phone}
                          </a>
                        )}
                        {inq.email && (
                          <a href={`mailto:${inq.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                            <Mail className="w-3.5 h-3.5" /> {inq.email}
                          </a>
                        )}
                        {inq.phone && (
                          <a href={getWhatsAppLink(inq.phone, inq.property?.title || 'the property')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{inq.message}</p>
                    </div>
                  </div>

                  {/* View Property Button */}
                  {inq.property?._id && (
                    <div className="mt-4">
                      <Link
                        to={`/properties/${inq.property._id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-sm font-medium transition-colors border border-primary-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Property: {inq.property.title}
                      </Link>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3 flex-wrap">
                    <p className="text-xs font-semibold text-gray-500">Update status:</p>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        disabled={inq.status === s || updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: inq._id, status: s })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                          inq.status === s
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="text-sm text-gray-600 px-2">{page} of {meta.pages}</span>
          <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
