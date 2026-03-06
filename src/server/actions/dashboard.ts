"use server";

import { requireAdmin } from "@/lib/auth-helpers";

import { getTotalPengeluaranBulanIni } from "./kas-keluar";
import { getTotalPemasukanBulanIni } from "./kas-masuk";
import { getMonthlyChartData, getSaldoKas } from "./laporan";
import { getRecentActivity } from "./log-aktivitas";
import { getTotalWarga } from "./warga";

export async function getDashboardStats() {
  await requireAdmin();
  const [totalWarga, saldoKas, pemasukanBulanIni, pengeluaranBulanIni] = await Promise.all([
    getTotalWarga(),
    getSaldoKas(),
    getTotalPemasukanBulanIni(),
    getTotalPengeluaranBulanIni(),
  ]);
  return { totalWarga, saldoKas, pemasukanBulanIni, pengeluaranBulanIni };
}

export { getRecentActivity, getMonthlyChartData };
