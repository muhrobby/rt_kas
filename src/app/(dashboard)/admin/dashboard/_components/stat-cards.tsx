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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Warga Aktif</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{totalWarga}</div>
          <p className="text-muted-foreground text-xs">Kepala keluarga terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Saldo Kas</CardTitle>
          <WalletIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{formatRupiah(saldoKas)}</div>
          <p className="text-muted-foreground text-xs">Total saldo kas RT saat ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Pemasukan Bulan Ini</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-green-600">{formatRupiah(pemasukanBulanIni)}</div>
          <p className="text-muted-foreground text-xs">Total iuran masuk bulan ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Pengeluaran Bulan Ini</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-red-500">{formatRupiah(pengeluaranBulanIni)}</div>
          <p className="text-muted-foreground text-xs">Total pengeluaran bulan ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
