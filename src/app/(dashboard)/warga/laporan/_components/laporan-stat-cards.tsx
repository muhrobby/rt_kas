import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

interface LaporanStatCardsProps {
  saldoKas: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  periodLabel: string;
}

export function LaporanStatCards({
  saldoKas,
  pemasukanBulanIni,
  pengeluaranBulanIni,
  periodLabel,
}: LaporanStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Saldo Kas RT</CardTitle>
          <WalletIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{formatRupiah(saldoKas)}</div>
          <p className="text-muted-foreground text-xs">Total saldo kas RT saat ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Pemasukan {periodLabel}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-green-600">{formatRupiah(pemasukanBulanIni)}</div>
          <p className="text-muted-foreground text-xs">Total iuran masuk {periodLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Pengeluaran {periodLabel}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-red-500">{formatRupiah(pengeluaranBulanIni)}</div>
          <p className="text-muted-foreground text-xs">Total pengeluaran {periodLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}
