import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Eye, Heart, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, propertyTypeLabel, statusColors, getPrimaryImage, truncate } from '../../utils/helpers';

export default function PropertyCard({ property, index = 0 }) {
  const { _id, title, propertyType, tenantType, occupancy, isVerified, rent, bedrooms, bathrooms, location, images, status, impressions, area } = property;
  const primaryImage = getPrimaryImage(images);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/properties/${_id}`} className="card block overflow-hidden group">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[calc(100%-3rem)]">
            <span className={`badge text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
              {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
            <span className="badge bg-white/90 text-gray-700 backdrop-blur-sm">
              {propertyTypeLabel[propertyType] || propertyType}
            </span>
            {tenantType && tenantType !== 'any' && (
              <span className={`badge text-xs font-semibold ${
                tenantType === 'family' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {tenantType === 'family' ? '👨‍👩‍👧 Family' : '🎓 Bachelor'}
              </span>
            )}
            {occupancy && occupancy !== 'any' && (
              <span className="badge text-xs font-semibold bg-purple-500 text-white">
                {occupancy === 'boys' ? '👦 Boys' : occupancy === 'girls' ? '👧 Girls' : '🤝 Co-ed'}
              </span>
            )}
          </div>
          {/* View count */}
          {isVerified && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 shadow">
              ✓ Verified
            </div>
          )}
          {impressions?.views > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              <Eye className="w-3 h-3" />
              <span>{impressions.views}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 group-hover:text-primary-600 transition-colors">
            {truncate(title, 60)}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{location?.locality ? `${location.locality}, ` : ''}{location?.city}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
              </div>
            )}
            {bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </div>
            )}
            {area?.size && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{area.size} {area.unit}</span>
              </div>
            )}
          </div>

          {/* Rent */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(rent?.amount)}</span>
              <span className="text-gray-400 text-sm ml-1">/{rent?.type === 'per-day' ? 'day' : 'mo'}</span>
            </div>
            {rent?.isNegotiable && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Negotiable</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
