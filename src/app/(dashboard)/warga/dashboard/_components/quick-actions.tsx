import Link from "next/link";

import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button asChild size="lg" className="h-12 text-base">
        <Link href="/warga/riwayat">Lihat Riwayat &amp; E-Kuitansi</Link>
      </Button>
    </div>
  );
}
