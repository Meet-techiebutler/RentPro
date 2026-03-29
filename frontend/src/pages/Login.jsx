import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, LogIn, MapPin, Shield, Star, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const STATS = [
  { label: 'Properties Listed', value: '10,000+', icon: Home },
  { label: 'Verified Brokers', value: '500+', icon: Shield },
  { label: 'Happy Tenants', value: '25,000+', icon: Star },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/broker');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Hero Image ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85"
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/75 to-primary-600/60" />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Rent<span className="text-yellow-300">Pro</span></span>
          </Link>

          {/* Main headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <span className="inline-block bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 mb-5">
                🏡 Rajkot's #1 Rental Platform
              </span>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                Your Dream Home
                <span className="block text-yellow-300">Awaits You</span>
              </h1>
              <p className="text-white/75 text-base leading-relaxed max-w-sm">
                Access thousands of verified rental properties across Rajkot. Manage listings, connect with tenants, and grow your portfolio.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 mt-10"
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                  <s.icon className="w-5 h-5 text-yellow-300 mb-2" />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-white/65 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/85 text-sm leading-relaxed italic">
                "RentPro made finding tenants for my 3 properties incredibly easy. The dashboard is intuitive and the leads are genuine."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-sm font-bold text-white">R</div>
                <div>
                  <p className="text-white text-sm font-semibold">Ravi Patel</p>
                  <p className="text-white/55 text-xs">Property Broker, Rajkot</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Rent<span className="text-primary-600">Pro</span></span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1.5 text-sm">Sign in to your broker or admin account</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@rentpro.com"
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="input-field pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">Demo Access</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Demo credentials */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ email: 'admin@rentpro.com', password: 'Admin@123456' })}
                  className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group text-left"
                >
                  <span className="text-xs font-bold text-primary-600 group-hover:text-primary-700">Admin</span>
                  <span className="text-xs text-gray-500 mt-0.5">admin@rentpro.com</span>
                  <span className="text-xs text-gray-400">Admin@123456</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'ravi@rentpro.com', password: 'Broker@123' })}
                  className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group text-left"
                >
                  <span className="text-xs font-bold text-primary-600 group-hover:text-primary-700">Broker</span>
                  <span className="text-xs text-gray-500 mt-0.5">ravi@rentpro.com</span>
                  <span className="text-xs text-gray-400">Broker@123</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              <Link to="/" className="text-primary-600 hover:underline font-medium">← Back to Home</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
