import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(n);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

export const propertyTypeLabel = {
  flat: 'Flat', tenement: 'Tenement', villa: 'Villa', studio: 'Studio',
  duplex: 'Duplex', penthouse: 'Penthouse', bungalow: 'Bungalow',
  farmhouse: 'Farmhouse', commercial: 'Commercial', pg: 'PG',
};

export const furnishingLabel = {
  'unfurnished': 'Unfurnished', 'semi-furnished': 'Semi-Furnished', 'fully-furnished': 'Fully Furnished',
};

export const statusColors = {
  available: 'bg-green-100 text-green-700',
  rented: 'bg-red-100 text-red-700',
  unavailable: 'bg-gray-100 text-gray-600',
};

export const inquiryStatusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
};

export const amenityIcons = {
  'gym': '🏋️', 'swimming-pool': '🏊', 'parking': '🅿️', 'lift': '🛗',
  'security': '🔒', 'cctv': '📷', 'power-backup': '⚡', 'wifi': '📶',
  'ac': '❄️', 'gas-pipeline': '🔥', 'intercom': '📞', 'club-house': '🏛️',
  'garden': '🌿', 'kids-play-area': '🎠', 'jogging-track': '🏃',
};

export const getWhatsAppLink = (phone, propertyTitle) => {
  const clean = phone?.replace(/\D/g, '');
  const msg = encodeURIComponent(`Hi, I'm interested in the property: ${propertyTitle}. Please share more details.`);
  return `https://wa.me/${clean}?text=${msg}`;
};

export const getPrimaryImage = (images) =>
  images?.find((i) => i.isPrimary)?.url || images?.[0]?.url || 'https://placehold.co/600x400?text=No+Image';
