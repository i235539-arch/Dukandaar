import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { adminService } from '../../services/adminService';
import { Loading, EmptyState } from '../common/Loading';

const TransactionVolumeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.transactionVolume()
      .then((r) => setData(r.data.data.series || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data.length) return <EmptyState title="No data" message="Volume chart will appear after some transactions." />;

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2c4a" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#15233f', border: '1px solid #1e2c4a', borderRadius: 8, color: '#e2e8f0' }}
            formatter={(v) => `PKR ${Number(v).toLocaleString()}`}
          />
          <Legend />
          <Area type="monotone" dataKey="total" stroke="#0ea5e9" fill="url(#vol)" name="Volume" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionVolumeChart;
