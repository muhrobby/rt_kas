import Link from "next/link";

import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="font-medium text-sm">Butuh detail pembayaran?</p>
      <p className="mt-1 text-muted-foreground text-sm">Buka riwayat untuk melihat detail pembayaran dan e-kuitansi.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="h-12 text-base">
          <Link href="/warga/riwayat">Lihat Riwayat Pembayaran</Link>
        </Button>
      </div>
    </div>
  );
}
