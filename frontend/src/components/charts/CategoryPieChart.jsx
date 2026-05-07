import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];

const CategoryPieChart = ({ data = [] }) => {
  if (!data.length) return <p className="text-muted">No data</p>;
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="_id" outerRadius={90} innerRadius={50} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#15233f', border: '1px solid #1e2c4a', borderRadius: 8, color: '#e2e8f0' }}
            formatter={(v) => `PKR ${Number(v).toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
