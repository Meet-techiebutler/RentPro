import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserCircle, Phone, Mail, Save, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import useAuthStore from '../store/useAuthStore';

export default function BrokerProfile() {
  const { user, refreshUser } = useAuthStore();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Profile updated successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profile.name.trim() || profile.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    profileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    passwordMutation.mutate(passwords);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Profile Edit */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserCircle className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              className="input-field"
              required
              minLength={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">💬 WhatsApp</span>
              </label>
              <input
                type="tel"
                value={profile.whatsapp}
                onChange={(e) => setProfile(p => ({ ...p, whatsapp: e.target.value }))}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {profileMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password *</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 8 characters"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwords.newPassword.length > 0 && passwords.newPassword.length < 8 && (
              <p className="text-xs text-red-500 mt-1">At least 8 characters required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwords.confirmPassword.length > 0 && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {passwords.confirmPassword.length > 0 && passwords.newPassword === passwords.confirmPassword && passwords.newPassword.length >= 8 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {passwordMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {passwordMutation.isPending ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
