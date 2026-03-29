import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Menu, X, LogOut, Shield, ChevronDown, MapPin, ListChecks, UserCircle, LayoutDashboard, MessageSquare, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { brokerApi } from '../../api/broker.api';
import useAuthStore from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const RAJKOT_AREAS = [
  { name: 'Kalawad Road',     key: 'Kalawad Road' },
  { name: 'University Road',  key: 'University Road' },
  { name: '150 Ft Ring Road', key: '150 Ft Ring Road' },
  { name: 'Mavdi',            key: 'Mavdi' },
  { name: 'Gondal Road',      key: 'Gondal Road' },
  { name: 'Bhaktinagar',      key: 'Bhaktinagar' },
  { name: 'Race Course Road', key: 'Race Course Road' },
  { name: 'Raiya Road',       key: 'Raiya Road' },
  { name: 'Airport Road',     key: 'Airport Road' },
  { name: 'Tagore Road',      key: 'Tagore Road' },
  { name: 'Nanamava',         key: 'Nanamava' },
  { name: 'Malviya Nagar',    key: 'Malviya Nagar' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin  = user?.role === 'admin';
  const isBroker = user?.role === 'broker';
  const isPublic = !user;

  // Logo destination: role-based
  const logoHref = isAdmin ? '/admin' : isBroker ? '/broker' : '/';

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Live new-inquiry count for broker badge
  const { data: inqData } = useQuery({
    queryKey: ['broker-new-inquiry-count'],
    queryFn: () => brokerApi.getInquiries({ status: 'new', limit: 1 }).then(r => r.data?.meta?.total || 0),
    enabled: isBroker,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
  const newInquiryCount = inqData || 0;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — role-aware destination */}
          <Link to={logoHref} className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rent<span className="text-primary-600">Pro</span></span>
          </Link>

          {/* ── Desktop centre nav ── */}
          <div className="hidden md:flex items-center gap-1">

            {/* PUBLIC: Home | Properties | Locations */}
            {isPublic && (
              <>
                <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Home</Link>
                <Link to="/properties" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/properties') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Properties</Link>
                <div className="relative">
                  <button
                    onClick={() => setLocMenuOpen(!locMenuOpen)}
                    onBlur={() => setTimeout(() => setLocMenuOpen(false), 150)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Locations
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${locMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {locMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rajkot Areas</p>
                        {RAJKOT_AREAS.map((area) => (
                          <Link key={area.key} to={`/properties?locality=${encodeURIComponent(area.key)}`} onClick={() => setLocMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                            <MapPin className="w-3 h-3 text-gray-400" />{area.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* BROKER: My Properties | Inquiries | My Profile */}
            {isBroker && (
              <>
                <Link to="/broker/properties" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/broker/properties') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <ListChecks className="w-4 h-4" /> My Properties
                </Link>
                <Link to="/broker/inquiries" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${isActive('/broker/inquiries') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <Bell className="w-4 h-4" /> Inquiries
                  {newInquiryCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {newInquiryCount > 9 ? '9+' : newInquiryCount}
                    </span>
                  )}
                </Link>
                <Link to="/broker" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/broker') && !location.pathname.startsWith('/broker/') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </>
            )}

            {/* ADMIN: no centre nav links */}
          </div>

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-purple-600' : 'bg-primary-600'}`}>
                    <span className="text-white text-sm font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                    <p className={`text-xs capitalize ${isAdmin ? 'text-purple-500' : 'text-primary-500'}`}>{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                          <Shield className="w-4 h-4 text-purple-500" /> Admin Dashboard
                        </Link>
                      )}
                      {isBroker && (
                        <>
                          <Link to="/broker/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                            <UserCircle className="w-4 h-4 text-primary-500" /> My Profile
                          </Link>
                          <Link to="/broker/inquiries" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                            <MessageSquare className="w-4 h-4 text-primary-500" /> Inquiries
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Login</Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {isPublic && (
                <>
                  <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Home</Link>
                  <Link to="/properties" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Properties</Link>
                  <div className="pt-1 pb-1">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rajkot Locations</p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {RAJKOT_AREAS.slice(0, 8).map((area) => (
                        <Link key={area.key} to={`/properties?locality=${encodeURIComponent(area.key)}`} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                          <MapPin className="w-3 h-3 text-gray-400" />{area.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50">Login</Link>
                </>
              )}
              {isBroker && (
                <>
                  <Link to="/broker/properties" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><ListChecks className="w-4 h-4 text-primary-500" /> My Properties</Link>
                  <Link to="/broker/inquiries" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span className="flex items-center gap-2"><Bell className="w-4 h-4 text-primary-500" /> Inquiries</span>
                    {newInquiryCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newInquiryCount > 9 ? '9+' : newInquiryCount} new</span>}
                  </Link>
                  <Link to="/broker" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4 text-primary-500" /> Dashboard</Link>
                  <Link to="/broker/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><UserCircle className="w-4 h-4 text-primary-500" /> My Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"><Shield className="w-4 h-4" /> Admin Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
