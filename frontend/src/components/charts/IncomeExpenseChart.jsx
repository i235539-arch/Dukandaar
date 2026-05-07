import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { reportService } from '../../services/reportService';
import { Loading, EmptyState } from '../common/Loading';

const IncomeExpenseChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.incomeExpense()
      .then((r) => setData(r.data.data.series || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data.length) return <EmptyState title="No data yet" message="Once you have transactions and expenses, charts will appear here." />;

  return (
    <div style={{ width: '100%', height: 280 }}>
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
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
