import { ArrowDownIcon, ArrowUpIcon, UsersIcon, WalletIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

interface StatCardsProps {
  totalWarga: number;
  saldoKas: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
}

export function StatCards({ totalWarga, saldoKas, pemasukanBulanIni, pengeluaranBulanIni }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="card-hover hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Warga Aktif</CardTitle>
          <UsersIcon className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-foreground tracking-tight">{totalWarga}</div>
          <p className="mt-1 text-muted-foreground text-xs">Kepala keluarga terdaftar</p>
        </CardContent>
      </Card>

      <Card className="card-hover hover:-translate-y-1 shadow-primary/5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Saldo Kas</CardTitle>
          <WalletIcon className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-foreground tracking-tight">{formatRupiah(saldoKas)}</div>
          <p className="mt-1 text-muted-foreground text-xs">Total saldo kas RT saat ini</p>
        </CardContent>
      </Card>

      <Card className="card-hover hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Pemasukan Bulan Ini</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-emerald-600 tracking-tight dark:text-emerald-500">
            {formatRupiah(pemasukanBulanIni)}
          </div>
          <p className="mt-1 text-muted-foreground text-xs">Total iuran masuk bulan ini</p>
        </CardContent>
      </Card>

      <Card className="card-hover hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Pengeluaran Bulan Ini</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-rose-600 dark:text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-rose-600 tracking-tight dark:text-rose-500">
            {formatRupiah(pengeluaranBulanIni)}
          </div>
          <p className="mt-1 text-muted-foreground text-xs">Total pengeluaran bulan ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
