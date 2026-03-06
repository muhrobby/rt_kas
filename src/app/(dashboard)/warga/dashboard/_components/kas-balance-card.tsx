import { formatRupiah, formatTanggal } from "@/lib/utils";

interface KasBalanceCardProps {
  balance: number;
}

export function KasBalanceCard({ balance }: KasBalanceCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="font-medium text-muted-foreground text-sm">Saldo Kas Lingkungan RT</p>
      <p className="mt-2 font-bold text-3xl tracking-tight">{formatRupiah(balance)}</p>
      <p className="mt-1 text-muted-foreground text-xs">Diperbarui: {formatTanggal(new Date())}</p>
    </div>
  );
}
