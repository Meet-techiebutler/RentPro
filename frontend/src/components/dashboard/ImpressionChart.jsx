import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function ImpressionChart({ data = [] }) {
  const formatted = data.map((d) => ({
    date: new Date(d._id + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    Views: d.totalViews,
    Listings: d.totalListings,
  }));

  if (!formatted.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No impression data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Area type="monotone" dataKey="Views" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorViews)" />
        <Area type="monotone" dataKey="Listings" stroke="#f97316" strokeWidth={2} fill="url(#colorListings)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
