import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Rent<span className="text-primary-400">Pro</span></span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Find your perfect rental property with ease. Search thousands of verified listings across India.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <span>support@rentpro.com</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white transition-colors">Browse Properties</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Broker Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm">
              {['Flat', 'Villa', 'Studio', 'Duplex', 'PG', 'Commercial'].map((t) => (
                <li key={t}>
                  <Link to={`/properties?propertyType=${t.toLowerCase()}`} className="hover:text-white transition-colors">{t}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RentPro. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>India's trusted rental platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
