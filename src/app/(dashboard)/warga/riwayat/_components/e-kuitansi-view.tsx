"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { BULAN_NAMES, formatRupiah, formatTanggal, formatWaktu } from "@/lib/utils";
import { getKuitansiDetail, type KuitansiDetail } from "@/server/actions/warga-riwayat";

interface EKuitansiViewProps {
  transaksiId: number | null;
  onClose: () => void;
}

export function EKuitansiView({ transaksiId, onClose }: EKuitansiViewProps) {
  const [detail, setDetail] = useState<KuitansiDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const open = transaksiId !== null;

  useEffect(() => {
    if (!transaksiId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getKuitansiDetail(transaksiId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [transaksiId]);

  const bulanLabel =
    detail?.bulanTagihan && detail?.tahunTagihan
      ? `${BULAN_NAMES[Number(detail.bulanTagihan) - 1]} ${detail.tahunTagihan}`
      : "-";

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg">E-Kuitansi</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-1 px-6 pb-2">
          {loading || !detail ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Receipt header */}
              <div className="mb-4 text-center">
                <p className="text-muted-foreground text-xs">Kas RT Lingkungan</p>
                <div className="my-3 border-t border-dashed" />
              </div>

              <Row label="No. Referensi" value={`TRX-${String(detail.id).padStart(6, "0")}`} mono />
              <Row label="Tanggal Bayar" value={formatTanggal(detail.waktuTransaksi)} />
              <div className="my-2 border-t border-dashed" />
              <Row label="Warga" value={detail.namaWarga} />
              <Row label="Blok / No." value={detail.blokRumah} />
              <Row label="Kategori" value={detail.namaKategori} />
              <Row label="Bulan" value={bulanLabel} />
              <Row label="Nominal" value={formatRupiah(detail.nominal)} bold />
              <div className="my-2 border-t border-dashed" />
              <Row label="Dicatat oleh" value={detail.dicatatOleh} />
              <Row label="Pada" value={formatWaktu(detail.waktuTransaksi)} />
              {detail.keterangan && <Row label="Keterangan" value={detail.keterangan} />}
              <div className="my-3 border-t border-dashed" />
              <p className="text-center text-muted-foreground text-xs">Ini adalah bukti pembayaran digital yang sah.</p>
            </>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Tutup
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="min-w-0 shrink-0 text-muted-foreground text-sm">{label}</span>
      <span className={`min-w-0 text-right text-sm ${bold ? "font-semibold" : ""} ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
