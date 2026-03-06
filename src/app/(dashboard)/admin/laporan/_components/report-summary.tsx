import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

interface ReportSummaryProps {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
}

export function ReportSummary({ totalMasuk, totalKeluar, saldo }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-xs">Total Pemasukan</p>
          <p className="font-bold text-green-600 text-xl">{formatRupiah(totalMasuk)}</p>
        </CardContent>
      </Card>
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-xs">Total Pengeluaran</p>
          <p className="font-bold text-red-500 text-xl">{formatRupiah(totalKeluar)}</p>
        </CardContent>
      </Card>
      <Card
        className={
          saldo >= 0
            ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
            : "border-orange-200 bg-orange-50"
        }
      >
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-xs">Saldo Akhir Periode</p>
          <p className={`font-bold text-xl ${saldo >= 0 ? "text-blue-600" : "text-orange-500"}`}>
            {formatRupiah(saldo)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
