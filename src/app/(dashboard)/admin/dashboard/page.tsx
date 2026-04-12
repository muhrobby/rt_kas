import { getDashboardStats, getMonthlyChartData, getRecentActivity } from "@/server/actions/dashboard";

import { MonthlyChartClient } from "./_components/monthly-chart-client";
import { RecentActivity } from "./_components/recent-activity";
import { StatCards } from "./_components/stat-cards";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const tahun = new Date().getFullYear();

  const [stats, recentActivity, monthlyData] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
    getMonthlyChartData(tahun),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm">Selamat datang di panel administrasi Kas RT.</p>
      </div>

      <StatCards
        totalWarga={stats.totalWarga}
        saldoKas={stats.saldoKas}
        pemasukanBulanIni={stats.pemasukanBulanIni}
        pengeluaranBulanIni={stats.pengeluaranBulanIni}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyChartClient data={monthlyData} tahun={tahun} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
