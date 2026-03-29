import { Routes, Route, Navigate } from 'react-router-dom';
import SocketProvider from './components/SocketProvider';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerProperties from './pages/BrokerProperties';
import AddEditProperty from './pages/AddEditProperty';
import BrokerInquiries from './pages/BrokerInquiries';
import BrokerProfile from './pages/BrokerProfile';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
  </div>
);

export default function App() {
  return (
    <SocketProvider>
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/properties" element={<PublicLayout><Properties /></PublicLayout>} />
      <Route path="/properties/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
      <Route path="/login" element={<Login />} />

      <Route path="/broker" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><BrokerDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/properties" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><BrokerProperties /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/properties/new" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><AddEditProperty /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/properties/:id/edit" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><AddEditProperty /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/inquiries" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><BrokerInquiries /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/profile" element={
        <ProtectedRoute roles={['broker', 'admin']}>
          <DashboardLayout><BrokerProfile /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </SocketProvider>
  );
}
