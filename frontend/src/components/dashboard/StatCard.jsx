import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, suffix = '', index = 0 }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
