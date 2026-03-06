import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { RekapItem } from "@/server/actions/laporan";

interface ReportTableProps {
  data: RekapItem[];
}

export function ReportTable({ data }: ReportTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Tidak ada transaksi pada periode yang dipilih.</p>
        </CardContent>
      </Card>
    );
  }

  let runningBalance = 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Uraian / Keterangan</TableHead>
                <TableHead className="text-right">Pemasukan (Rp)</TableHead>
                <TableHead className="text-right">Pengeluaran (Rp)</TableHead>
                <TableHead className="text-right">Saldo (Rp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                if (item.tipeArus === "masuk") {
                  runningBalance += item.nominal;
                } else {
                  runningBalance -= item.nominal;
                }
                const balanceSnapshot = runningBalance;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatTanggal(item.waktuTransaksi)}</TableCell>
                    <TableCell className="max-w-xs text-sm">
                      <div>{item.keterangan ?? "-"}</div>
                      {item.namaWarga && (
                        <div className="text-muted-foreground text-xs">
                          {item.namaWarga} — {item.blokRumah}
                        </div>
                      )}
                      {item.namaKategori && <div className="text-muted-foreground text-xs">{item.namaKategori}</div>}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {item.tipeArus === "masuk" ? formatRupiah(item.nominal) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {item.tipeArus === "keluar" ? formatRupiah(item.nominal) : "-"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${balanceSnapshot >= 0 ? "" : "text-red-500"}`}>
                      {formatRupiah(balanceSnapshot)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
