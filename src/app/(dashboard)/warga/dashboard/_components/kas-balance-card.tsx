import { formatRupiah } from "@/lib/utils";

interface KasBalanceCardProps {
  balance: number;
}

export function KasBalanceCard({ balance }: KasBalanceCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="font-medium text-muted-foreground text-sm">Saldo kas RT</p>
      <p className="mt-1 text-muted-foreground text-sm">Transparansi kas lingkungan saat ini</p>
      <p className="mt-2 font-bold text-3xl text-foreground tracking-tight">{formatRupiah(balance)}</p>
      <p className="mt-1 text-muted-foreground text-xs">Berdasarkan transaksi tercatat</p>
    </div>
  );
}
