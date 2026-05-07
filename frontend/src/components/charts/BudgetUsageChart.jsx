import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { reportService } from '../../services/reportService';
import { Loading, EmptyState } from '../common/Loading';

const BudgetUsageChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.budgetUsage()
      .then((r) => setData(r.data.data.series || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data.length) return <EmptyState title="No budgets yet" message="Create a budget to see usage trends." />;

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="#1e2c4a" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#15233f', border: '1px solid #1e2c4a', borderRadius: 8, color: '#e2e8f0' }}
            formatter={(v) => `PKR ${Number(v).toLocaleString()}`}
          />
          <Legend />
          <Bar dataKey="totalLimit" name="Limit" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent" name="Spent" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetUsageChart;
