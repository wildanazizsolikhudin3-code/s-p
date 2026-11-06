import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '../../services/reportService';
import StatCard from '../../components/dashboard/StatCard';
import LoanChart from '../../components/dashboard/LoanChart';
import CategoryChart from '../../components/dashboard/CategoryChart';
import RecentActivities from '../../components/dashboard/RecentActivities';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const stats = data?.stats || {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Buku" value={stats.total_books || 0} icon={BookOpen} color="blue" />
        <StatCard title="Anggota Aktif" value={stats.total_members || 0} icon={Users} color="green" />
        <StatCard title="Peminjaman Aktif" value={stats.active_loans || 0} icon={ArrowLeftRight} color="yellow" />
        <StatCard title="Terlambat" value={stats.overdue_loans || 0} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Peminjaman 6 Bulan Terakhir</h3>
          <LoanChart data={data?.monthly_loans || []} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Distribusi Kategori</h3>
          <CategoryChart data={data?.category_stats || []} />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Aktivitas Terbaru</h3>
        <RecentActivities data={data?.recent_loans || []} />
      </div>
    </div>
  );
};

export default Dashboard;
