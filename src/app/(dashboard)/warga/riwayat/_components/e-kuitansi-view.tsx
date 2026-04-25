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

  const validBulan = detail?.bulanTagihan && detail.bulanTagihan.trim() !== "";
  const periodeLabel =
    validBulan && detail?.tahunTagihan
      ? `${BULAN_NAMES[Number(detail.bulanTagihan) - 1]} ${detail.tahunTagihan}`
      : "Sekali Bayar";

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg">E-Kuitansi</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-6 pb-2">
          {loading || !detail ? (
            <div className="space-y-3">
              {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => (
                <Skeleton key={k} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-center text-muted-foreground text-xs">Kas RT Lingkungan</p>
                <div className="mt-3 rounded-lg bg-muted/40 px-4 py-3 text-center">
                  <p className="text-muted-foreground text-xs">Nominal pembayaran</p>
                  <p className="mt-1 font-semibold text-2xl tracking-tight">{formatRupiah(detail.nominal)}</p>
                  <p className="mt-1 text-muted-foreground text-xs">{detail.namaKategori}</p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Tanggal bayar</p>
                    <p className="font-medium text-sm">{formatTanggal(detail.waktuTransaksi)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Referensi</p>
                    <p className="font-mono text-sm">TRX-{String(detail.id).padStart(6, "0")}</p>
                  </div>
                </div>
              </div>

              <section className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Detail pembayaran</h3>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
                    {periodeLabel}
                  </span>
                </div>
                <div className="space-y-2">
                  <Row label="Warga" value={detail.namaWarga} />
                  <Row label="Blok / No." value={detail.blokRumah} />
                  <Row label="Kategori" value={detail.namaKategori} />
                  <Row label="Periode" value={periodeLabel} />
                </div>
              </section>

              <section className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="mb-3 font-semibold text-sm">Pencatat transaksi</h3>
                <div className="space-y-2">
                  <Row label="Dicatat oleh" value={detail.dicatatOleh} />
                  <Row label="Waktu input" value={formatWaktu(detail.waktuTransaksi)} />
                  {detail.keterangan && <Row label="Keterangan" value={detail.keterangan} />}
                </div>
              </section>

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
