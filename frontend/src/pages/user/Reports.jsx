import { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { expenseService } from '../../services/expenseService';
import { formatPKR } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import IncomeExpenseChart from '../../components/charts/IncomeExpenseChart';
import BudgetUsageChart from '../../components/charts/BudgetUsageChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import { Loading } from '../../components/common/Loading';

const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [catSummary, setCatSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.userDashboard(), expenseService.categorySummary()])
      .then(([a, b]) => { setOverview(a.data.data); setCatSummary(b.data.data.categories); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading size="lg" />;

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Visual breakdown of your money flows." />

      <div className="stat-grid">
        <div className="stat-tile"><div className="label">Wallet</div><div className="value">{formatPKR(overview?.wallet?.balance || 0)}</div></div>
        <div className="stat-tile"><div className="label">Invested</div><div className="value">{formatPKR(overview?.totalInvested || 0)}</div></div>
        <div className="stat-tile"><div className="label">Dividends</div><div className="value">{formatPKR(overview?.totalDividends || 0)}</div></div>
        <div className="stat-tile"><div className="label">This month expenses</div><div className="value">{formatPKR(overview?.monthExpenseTotal || 0)}</div></div>
      </div>

      <div className="row mt-24">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Income vs Expense</h3>
          <IncomeExpenseChart />
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Budget Usage</h3>
          <BudgetUsageChart />
        </div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Spending by Category</h3>
        <CategoryPieChart data={catSummary} />
      </div>
    </>
  );
};

export default Reports;
