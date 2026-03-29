import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, MapPin, Plus, Minus, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { propertyApi } from '../api/property.api';
import { PageLoader } from '../components/common/Loader';
import useAuthStore from '../store/useAuthStore';

const PROPERTY_TYPES = ['flat','tenement','villa','studio','duplex','penthouse','bungalow','farmhouse','commercial','pg'];
const FURNISHING = ['unfurnished','semi-furnished','fully-furnished'];
const TENANT_TYPES = [
  { value: 'any',      label: 'Any / All',    icon: '🏠', desc: 'Open to everyone' },
  { value: 'family',  label: 'Family Only',  icon: '👨‍👩‍👧', desc: 'Bachelors not allowed' },
  { value: 'bachelor',label: 'Bachelor OK',  icon: '🎓', desc: 'Students & professionals' },
];
const OCCUPANCY_TYPES = [
  { value: 'any',   label: 'Any',       icon: '👥', desc: 'No restriction' },
  { value: 'boys',  label: 'Boys Only', icon: '👦', desc: 'Male tenants only' },
  { value: 'girls', label: 'Girls Only',icon: '👧', desc: 'Female tenants only' },
  { value: 'coed',  label: 'Co-ed',     icon: '🤝', desc: 'Mixed occupancy' },
];
const AMENITIES = ['gym','swimming-pool','parking','lift','security','cctv','power-backup','wifi','ac','gas-pipeline','intercom','club-house','garden','kids-play-area','jogging-track'];
const NEARBY_TYPES = ['hospital','school','college','gym','bar','restaurant','market','pharmacy','bank','atm','bus-stop','metro','mall','park'];
const label = (s) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const defaultForm = {
  title: '', description: '', propertyType: 'flat', status: 'available',
  rent: { amount: '', type: 'monthly', isNegotiable: false, deposit: '' },
  area: { size: '', unit: 'sqft' },
  bedrooms: 1, bathrooms: 1, furnishing: 'unfurnished', tenantType: 'any', occupancy: 'any',
  amenities: [],
  nearbyFacilities: [],
  location: { address: '', locality: '', city: '', state: '', pincode: '', coordinates: { type: 'Point', coordinates: ['', ''] } },
  contact: { whatsapp: '', email: '', phone: '' },
  tags: '',
  isFeatured: false,
};

export default function AddEditProperty() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removingImgId, setRemovingImgId] = useState(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const setError = (key, msg) => setErrors(e => ({ ...e, [key]: msg }));
  const clearError = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const validateStep0 = () => {
    const errs = {};
    if (!form.title.trim())            errs.title = 'Title is required (min 5 chars)';
    else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.description.trim())      errs.description = 'Description is required';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    if (!form.rent.amount || Number(form.rent.amount) <= 0) errs.rentAmount = 'Rent amount must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.location.address.trim())  errs.address  = 'Full address is required';
    if (!form.location.city.trim())     errs.city     = 'City is required';
    if (!form.location.state.trim())    errs.state    = 'State is required';
    const [lng, lat] = form.location.coordinates.coordinates;
    if (!lng || !lat) errs.coords = 'GPS coordinates are required — click "Use My Location" or enter manually';
    else if (Number(lng) < -180 || Number(lng) > 180) errs.coords = 'Longitude must be between -180 and 180';
    else if (Number(lat) < -90  || Number(lat) > 90)  errs.coords = 'Latitude must be between -90 and 90';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!form.contact.phone.trim() && !form.contact.whatsapp.trim() && !form.contact.email.trim())
      errs.contact = 'At least one contact method (phone, WhatsApp, or email) is required';
    if (images.length === 0 && existingImages.length === 0)
      errs.images = 'Please upload at least one property image';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['property-edit', id],
    queryFn: () => propertyApi.getById(id).then((r) => r.data.data.property),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setExistingImages(existing.images || []);
      setForm({
        title: existing.title || '',
        description: existing.description || '',
        propertyType: existing.propertyType || 'flat',
        status: existing.status || 'available',
        rent: { amount: existing.rent?.amount || '', type: existing.rent?.type || 'monthly', isNegotiable: existing.rent?.isNegotiable || false, deposit: existing.rent?.deposit || '' },
        area: { size: existing.area?.size || '', unit: existing.area?.unit || 'sqft' },
        bedrooms: existing.bedrooms || 1,
        bathrooms: existing.bathrooms || 1,
        furnishing: existing.furnishing || 'unfurnished',
        tenantType: existing.tenantType || 'any',
        occupancy: existing.occupancy || 'any',
        amenities: existing.amenities || [],
        nearbyFacilities: existing.nearbyFacilities || [],
        location: { address: existing.location?.address || '', locality: existing.location?.locality || '', city: existing.location?.city || '', state: existing.location?.state || '', pincode: existing.location?.pincode || '', coordinates: existing.location?.coordinates || { type: 'Point', coordinates: ['', ''] } },
        contact: { whatsapp: existing.contact?.whatsapp || '', email: existing.contact?.email || '', phone: existing.contact?.phone || '' },
        tags: (existing.tags || []).join(', '),
        isFeatured: existing.isFeatured || false,
      });
    }
  }, [existing]);

  // Pre-fill contact from broker profile
  useEffect(() => {
    if (!isEdit && user) {
      setForm(f => ({ ...f, contact: { whatsapp: user.whatsapp || '', email: user.email || '', phone: user.phone || '' } }));
    }
  }, [user, isEdit]);

  const mutation = useMutation({
    mutationFn: (formData) => isEdit ? propertyApi.update(id, formData) : propertyApi.create(formData),
    onSuccess: () => {
      toast.success(isEdit ? 'Property updated!' : 'Property created!');
      queryClient.invalidateQueries({ queryKey: ['broker-properties'] });
      queryClient.invalidateQueries({ queryKey: ['broker-dashboard'] });
      navigate('/broker/properties');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save property'),
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (img) => {
    setRemovingImgId(img.publicId);
    try {
      await propertyApi.deleteImage(id, img.publicId);
      setExistingImages(prev => prev.filter(i => i.publicId !== img.publicId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    } finally {
      setRemovingImgId(null);
    }
  };

  const toggleAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const addNearby = () => setForm(f => ({ ...f, nearbyFacilities: [...f.nearbyFacilities, { name: '', type: 'school', distance: '', unit: 'km' }] }));
  const removeNearby = (i) => setForm(f => ({ ...f, nearbyFacilities: f.nearbyFacilities.filter((_, idx) => idx !== i) }));
  const updateNearby = (i, key, val) => setForm(f => {
    const nf = [...f.nearbyFacilities];
    nf[i] = { ...nf[i], [key]: val };
    return { ...f, nearbyFacilities: nf };
  });

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    const fd = new FormData();
    images.forEach(img => fd.append('images', img));

    const payload = {
      ...form,
      rent: { ...form.rent, amount: Number(form.rent.amount), deposit: Number(form.rent.deposit) || 0 },
      area: { ...form.area, size: Number(form.area.size) || undefined },
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      location: { ...form.location, coordinates: { type: 'Point', coordinates: [Number(form.location.coordinates.coordinates[0]), Number(form.location.coordinates.coordinates[1])] } },
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    Object.entries(payload).forEach(([k, v]) => {
      if (typeof v === 'object') fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });

    mutation.mutate(fd);
  };

  const RAJKOT_DEFAULT = { lng: '70.802160', lat: '22.303894' };

  const setCoords = (lng, lat) => {
    setForm(f => ({ ...f, location: { ...f.location, coordinates: { type: 'Point', coordinates: [lng, lat] } } }));
    clearError('coords');
  };

  const tryGeolocation = () => {
    if (!window.isSecureContext) {
      toast('Geolocation needs HTTPS. Using Rajkot default — adjust manually if needed.', { icon: '📍' });
      setCoords(RAJKOT_DEFAULT.lng, RAJKOT_DEFAULT.lat);
      return;
    }
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    const toastId = toast.loading('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(pos.coords.longitude.toFixed(6), pos.coords.latitude.toFixed(6));
        toast.success('Location captured!', { id: toastId });
      },
      (err) => {
        const msgs = {
          1: 'Location permission denied. Please allow location access in browser settings.',
          2: 'Location unavailable. Using Rajkot default — adjust if needed.',
          3: 'Location request timed out. Using Rajkot default — adjust if needed.',
        };
        toast.error(msgs[err.code] || 'Could not get location.', { id: toastId });
        if (err.code !== 1) setCoords(RAJKOT_DEFAULT.lng, RAJKOT_DEFAULT.lat);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const steps = ['Basic Info', 'Location', 'Amenities', 'Images & Contact'];

  if (loadingExisting) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/broker/properties')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-gray-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex bg-white rounded-2xl shadow-card p-1 gap-1">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${step === i ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="hidden sm:inline">{s}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); clearError('title'); }} placeholder="e.g. Spacious 2BHK in Andheri West" className={`input-field ${errors.title ? 'border-red-400 focus:ring-red-300' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description *</label>
            <textarea value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); clearError('description'); }} rows={4} placeholder="Describe the property..." className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-300' : ''}`} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Property Type *</label>
              <select value={form.propertyType} onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))} className="input-field">
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                {['available','rented','unavailable'].map(s => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Rent Amount (₹) *</label>
              <input type="number" value={form.rent.amount} onChange={e => { setForm(f => ({ ...f, rent: { ...f.rent, amount: e.target.value } })); clearError('rentAmount'); }} placeholder="15000" className={`input-field ${errors.rentAmount ? 'border-red-400 focus:ring-red-300' : ''}`} />
              {errors.rentAmount && <p className="text-red-500 text-xs mt-1">{errors.rentAmount}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Rent Type</label>
              <select value={form.rent.type} onChange={e => setForm(f => ({ ...f, rent: { ...f.rent, type: e.target.value } }))} className="input-field">
                <option value="monthly">Monthly</option>
                <option value="per-day">Per Day</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Deposit (₹)</label>
              <input type="number" value={form.rent.deposit} onChange={e => setForm(f => ({ ...f, rent: { ...f.rent, deposit: e.target.value } }))} placeholder="30000" className="input-field" />
            </div>
          </div>
          {/* Tenant Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Preferred Tenant</label>
            <div className="grid grid-cols-3 gap-3">
              {TENANT_TYPES.map(({ value, label: lbl, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tenantType: value }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                    form.tenantType === value
                      ? value === 'family' ? 'bg-green-50 border-green-500'
                      : value === 'bachelor' ? 'bg-blue-50 border-blue-500'
                      : 'bg-primary-50 border-primary-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-semibold text-gray-800">{lbl}</span>
                  <span className="text-xs text-gray-400 leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Occupancy */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Occupancy Type</label>
            <div className="grid grid-cols-4 gap-2">
              {OCCUPANCY_TYPES.map(({ value, label: lbl, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, occupancy: value }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                    form.occupancy === value
                      ? 'bg-purple-50 border-purple-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold text-gray-800">{lbl}</span>
                  <span className="text-xs text-gray-400 leading-tight hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Bedrooms</label>
              <input type="number" min="0" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Bathrooms</label>
              <input type="number" min="0" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Furnishing</label>
              <select value={form.furnishing} onChange={e => setForm(f => ({ ...f, furnishing: e.target.value }))} className="input-field">
                {FURNISHING.map(f => <option key={f} value={f}>{label(f)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Area Size</label>
              <input type="number" value={form.area.size} onChange={e => setForm(f => ({ ...f, area: { ...f.area, size: e.target.value } }))} placeholder="850" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Unit</label>
              <select value={form.area.unit} onChange={e => setForm(f => ({ ...f, area: { ...f.area, unit: e.target.value } }))} className="input-field">
                <option value="sqft">sqft</option>
                <option value="sqm">sqm</option>
                <option value="bhk">BHK</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="neg" checked={form.rent.isNegotiable} onChange={e => setForm(f => ({ ...f, rent: { ...f.rent, isNegotiable: e.target.checked } }))} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="neg" className="text-sm font-medium text-gray-700">Rent is negotiable</label>
            <input type="checkbox" id="feat" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-primary-600 ml-4" />
            <label htmlFor="feat" className="text-sm font-medium text-gray-700">Mark as Featured</label>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="pet-friendly, north-facing, corner-unit" className="input-field" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => { if (validateStep0()) { setErrors({}); setStep(1); } }} className="btn-primary">Next: Location →</button>
          </div>
        </motion.div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Address *</label>
            <input value={form.location.address} onChange={e => { setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } })); clearError('address'); }} placeholder="Flat No, Building Name, Street" className={`input-field ${errors.address ? 'border-red-400' : ''}`} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Locality</label>
              <input value={form.location.locality} onChange={e => setForm(f => ({ ...f, location: { ...f.location, locality: e.target.value } }))} placeholder="e.g. Kalawad Road" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">City *</label>
              <input value={form.location.city} onChange={e => { setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } })); clearError('city'); }} placeholder="e.g. Rajkot" className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">State *</label>
              <input value={form.location.state} onChange={e => { setForm(f => ({ ...f, location: { ...f.location, state: e.target.value } })); clearError('state'); }} placeholder="e.g. Gujarat" className={`input-field ${errors.state ? 'border-red-400' : ''}`} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Pincode</label>
              <input value={form.location.pincode} onChange={e => setForm(f => ({ ...f, location: { ...f.location, pincode: e.target.value } }))} placeholder="400001" className="input-field" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm font-semibold text-blue-800">GPS Coordinates *</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setCoords(RAJKOT_DEFAULT.lng, RAJKOT_DEFAULT.lat); toast.success('Rajkot centre set — adjust if needed'); }}
                  className="flex items-center gap-1.5 text-xs bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  📍 Rajkot Default
                </button>
                <button type="button" onClick={tryGeolocation}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <MapPin className="w-3.5 h-3.5" /> Use My Location
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-blue-700 mb-1 block">Longitude</label>
                <input type="number" step="any"
                  value={form.location.coordinates.coordinates[0]}
                  onChange={e => setCoords(e.target.value, form.location.coordinates.coordinates[1])}
                  placeholder="70.8022"
                  className={`input-field text-sm ${errors.coords ? 'border-red-400' : ''}`} />
              </div>
              <div>
                <label className="text-xs text-blue-700 mb-1 block">Latitude</label>
                <input type="number" step="any"
                  value={form.location.coordinates.coordinates[1]}
                  onChange={e => setCoords(form.location.coordinates.coordinates[0], e.target.value)}
                  placeholder="22.3039"
                  className={`input-field text-sm ${errors.coords ? 'border-red-400' : ''}`} />
              </div>
            </div>
            {errors.coords
              ? <p className="text-red-500 text-xs mt-2 font-medium">{errors.coords}</p>
              : <p className="text-xs text-blue-600 mt-2">
                  💡 Click <strong>Rajkot Default</strong> to auto-fill, or{' '}
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="underline font-medium">open Google Maps</a>
                  {' '}→ right-click any spot → copy coordinates
                </p>
            }
          </div>

          <div className="flex justify-between">
            <button onClick={() => { setErrors({}); setStep(0); }} className="btn-secondary">← Back</button>
            <button onClick={() => { if (validateStep1()) { setErrors({}); setStep(2); } }} className="btn-primary">Next: Amenities →</button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Amenities & Nearby */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map(a => (
                <label key={a} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${form.amenities.includes(a) ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-primary-600" />
                  <span className="text-sm text-gray-700">{label(a)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Nearby Facilities</h3>
              <button onClick={addNearby} className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {form.nearbyFacilities.map((nf, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={nf.name} onChange={e => updateNearby(i, 'name', e.target.value)} placeholder="Name" className="input-field text-sm col-span-4" />
                  <select value={nf.type} onChange={e => updateNearby(i, 'type', e.target.value)} className="input-field text-sm col-span-3">
                    {NEARBY_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
                  </select>
                  <input type="number" value={nf.distance} onChange={e => updateNearby(i, 'distance', e.target.value)} placeholder="Dist" className="input-field text-sm col-span-2" />
                  <select value={nf.unit} onChange={e => updateNearby(i, 'unit', e.target.value)} className="input-field text-sm col-span-2">
                    <option value="km">km</option>
                    <option value="m">m</option>
                  </select>
                  <button onClick={() => removeNearby(i)} className="col-span-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => { setErrors({}); setStep(1); }} className="btn-secondary">← Back</button>
            <button onClick={() => { setErrors({}); setStep(3); }} className="btn-primary">Next: Images →</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Images & Contact */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Property Images (up to 10) <span className="text-red-500">*</span>
            </h3>
            {errors.images && <p className="text-red-500 text-xs mb-2">{errors.images}</p>}

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.publicId || img.url} className="relative group">
                      <img src={img.url} alt="" className="w-full h-20 object-cover rounded-xl bg-gray-100" />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 text-[9px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full font-semibold">Primary</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        disabled={removingImgId === img.publicId}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-70"
                      >
                        {removingImgId === img.publicId
                          ? <span className="w-2.5 h-2.5 border border-white/40 border-t-white rounded-full animate-spin" />
                          : <X className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New upload area */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <Upload className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Click to upload {isEdit ? 'more' : ''} images</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10MB each</p>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {/* New upload previews */}
            {previews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New Uploads</p>
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-20 object-cover rounded-xl" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact Details <span className="text-gray-400 font-normal text-xs">(at least one required)</span></h3>
            {errors.contact && <p className="text-red-500 text-xs mb-2">{errors.contact}</p>}
            <div className="space-y-3">
              <input value={form.contact.whatsapp} onChange={e => { setForm(f => ({ ...f, contact: { ...f.contact, whatsapp: e.target.value } })); clearError('contact'); }} placeholder="WhatsApp number (with country code)" className={`input-field ${errors.contact ? 'border-red-300' : ''}`} />
              <input type="email" value={form.contact.email} onChange={e => { setForm(f => ({ ...f, contact: { ...f.contact, email: e.target.value } })); clearError('contact'); }} placeholder="Contact email" className={`input-field ${errors.contact ? 'border-red-300' : ''}`} />
              <input value={form.contact.phone} onChange={e => { setForm(f => ({ ...f, contact: { ...f.contact, phone: e.target.value } })); clearError('contact'); }} placeholder="Phone number" className={`input-field ${errors.contact ? 'border-red-300' : ''}`} />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
            <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
              {mutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Update Property' : 'Publish Property'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
