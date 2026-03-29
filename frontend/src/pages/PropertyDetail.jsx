import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin, Bed, Bath, Maximize2, CheckCircle, Phone, Mail,
  MessageCircle, ArrowLeft, Eye, Calendar, Building2, Zap, Home
} from 'lucide-react';
import { propertyApi } from '../api/property.api';
import PropertyImageGallery from '../components/property/PropertyImageGallery';
import { PageLoader } from '../components/common/Loader';
import {
  formatCurrency, formatDate, propertyTypeLabel, furnishingLabel,
  statusColors, amenityIcons, getWhatsAppLink
} from '../utils/helpers';

export default function PropertyDetail() {
  const { id } = useParams();
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getById(id).then((r) => r.data.data.property),
  });

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.message) return toast.error('Name and message are required.');
    setSubmitting(true);
    try {
      await propertyApi.submitInquiry(id, { ...inquiryForm, channel: 'form' });
      toast.success('Inquiry sent! The broker will contact you soon.');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !data) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Property not found</h2>
      <Link to="/properties" className="btn-primary mt-6 inline-block">Browse Properties</Link>
    </div>
  );

  const p = data;
  const coords = p.location?.coordinates?.coordinates;
  const hasCoords = coords?.length === 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <Link to="/properties" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <PropertyImageGallery images={p.images} />

          {/* Title & Meta */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${statusColors[p.status]}`}>{p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}</span>
              <span className="badge bg-primary-50 text-primary-700">{propertyTypeLabel[p.propertyType]}</span>
              {p.isFeatured && <span className="badge bg-yellow-100 text-yellow-700">⭐ Featured</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{p.title}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{p.location?.address}{p.location?.locality ? `, ${p.location.locality}` : ''}, {p.location?.city}, {p.location?.state}</span>
            </div>
          </motion.div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Bed, label: 'Bedrooms', value: p.bedrooms || 'N/A' },
              { icon: Bath, label: 'Bathrooms', value: p.bathrooms || 'N/A' },
              { icon: Maximize2, label: 'Area', value: p.area?.size ? `${p.area.size} ${p.area.unit}` : 'N/A' },
              { icon: Home, label: 'Furnishing', value: furnishingLabel[p.furnishing] || 'N/A' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <s.icon className="w-5 h-5 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">About this property</h3>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{p.description}</p>
          </div>

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{amenityIcons[a]} {a.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Facilities */}
          {p.nearbyFacilities?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Nearby Facilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.nearbyFacilities.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Zap className="w-4 h-4 text-accent-500" />
                      <span className="font-medium">{f.name}</span>
                      <span className="text-gray-400 capitalize">({f.type})</span>
                    </div>
                    {f.distance && <span className="text-xs text-gray-500">{f.distance} {f.unit}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {hasCoords && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="p-5 pb-0">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">Location</h3>
              </div>
              <div style={{ height: 280 }}>
                <MapContainer center={[coords[1], coords[0]]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords[1], coords[0]]}>
                    <Popup>{p.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2"><Eye className="w-4 h-4" /> {p.impressions?.views || 0} views</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Listed {formatDate(p.createdAt)}</div>
            {p.availableFrom && <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Available from {formatDate(p.availableFrom)}</div>}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Rent Card */}
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20">
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">{formatCurrency(p.rent?.amount)}</span>
              <span className="text-gray-400 text-sm ml-1">/{p.rent?.type === 'per-day' ? 'day' : 'month'}</span>
              {p.rent?.isNegotiable && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Negotiable</span>}
            </div>
            {p.rent?.deposit > 0 && (
              <p className="text-sm text-gray-500 mb-4">Security deposit: <span className="font-semibold text-gray-900">{formatCurrency(p.rent.deposit)}</span></p>
            )}

            {/* Contact Buttons */}
            <div className="space-y-3">
              {(p.contact?.whatsapp || p.broker?.whatsapp) && (
                <a
                  href={getWhatsAppLink(p.contact?.whatsapp || p.broker?.whatsapp, p.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {(p.contact?.phone || p.broker?.phone) && (
                <a href={`tel:${p.contact?.phone || p.broker?.phone}`} className="w-full flex items-center justify-center gap-2 btn-secondary">
                  <Phone className="w-4 h-4" /> Call Broker
                </a>
              )}
              {(p.contact?.email || p.broker?.email) && (
                <a href={`mailto:${p.contact?.email || p.broker?.email}?subject=Inquiry about ${p.title}`} className="w-full flex items-center justify-center gap-2 btn-secondary">
                  <Mail className="w-4 h-4" /> Email Broker
                </a>
              )}
            </div>

            {/* Broker Info */}
            {p.broker && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-sm">{p.broker.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.broker.name}</p>
                  <p className="text-xs text-gray-400">Listed broker</p>
                </div>
              </div>
            )}
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Send an Inquiry</h3>
            <form onSubmit={handleInquiry} className="space-y-3">
              <input type="text" placeholder="Your Name *" value={inquiryForm.name} onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })} className="input-field text-sm" />
              <input type="email" placeholder="Email" value={inquiryForm.email} onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })} className="input-field text-sm" />
              <input type="tel" placeholder="Phone" value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} className="input-field text-sm" />
              <textarea
                placeholder="Your message *"
                rows={4}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                className="input-field text-sm resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
