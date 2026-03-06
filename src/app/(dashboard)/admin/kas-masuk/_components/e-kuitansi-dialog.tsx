"use client";

import { useState } from "react";

import { DownloadIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatRupiah, formatTanggal, formatWaktu } from "@/lib/utils";

interface EKuitansiData {
  refNumber: string;
  wargaData: { namaKepalaKeluarga: string; blokRumah: string };
  kategoriData: { namaKategori: string };
  bulanTagihan: string[];
  tahunTagihan: number;
  /** Nominal per bulan (atau nominal total untuk sekali bayar) */
  nominal: number;
  /** Total yang benar-benar dibayar: nominal × bulan (bulanan) atau nominal (sekali) */
  totalDibayar: number;
  keterangan?: string | null;
  tanggal: Date;
}

interface EKuitansiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EKuitansiData | null;
}

export function EKuitansiDialog({ open, onOpenChange, data }: EKuitansiDialogProps) {
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  const isSekali = data.bulanTagihan.length === 0;

  async function handleDownloadPDF() {
    if (!data) return;
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        ref: data.refNumber,
        tanggal: data.tanggal.toISOString(),
        wargaNama: data.wargaData.namaKepalaKeluarga,
        wargaBlok: data.wargaData.blokRumah,
        namaKategori: data.kategoriData.namaKategori,
        bulanTagihan: data.bulanTagihan.join(","),
        tahunTagihan: String(data.tahunTagihan),
        nominal: String(data.nominal),
        totalDibayar: String(data.totalDibayar),
        ...(data.keterangan ? { keterangan: data.keterangan } : {}),
      });

      const res = await fetch(`/api/kuitansi/pdf?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengunduh PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.refNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent — user can retry
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Kuitansi Pembayaran</DialogTitle>
        </DialogHeader>

        {/* ── Invoice card ────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          {/* Header strip */}
          <div className="bg-blue-600 px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg text-white tracking-wide">KAS RT</p>
                <p className="text-blue-200 text-xs">Sistem Manajemen Keuangan RT</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-white tracking-widest">KUITANSI</p>
                <p className="font-mono text-blue-200 text-xs">{data.refNumber}</p>
                <span className="mt-1 inline-block rounded bg-green-400 px-2 py-0.5 font-bold text-green-900 text-xs">
                  ✓ LUNAS
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Meta */}
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-0.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Diterima dari
                </p>
                <p className="font-semibold">{data.wargaData.namaKepalaKeluarga}</p>
                <p className="text-muted-foreground text-xs">Blok {data.wargaData.blokRumah}</p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Tanggal</p>
                <p className="font-medium">{formatTanggal(data.tanggal)}</p>
                <p className="text-muted-foreground text-xs">{formatWaktu(data.tanggal).split(", ")[1]}</p>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Line item */}
            <div className="mb-3 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="font-medium">{data.kategoriData.namaKategori}</span>
                <span className="font-semibold tabular-nums">{formatRupiah(data.totalDibayar)}</span>
              </div>
              {isSekali ? (
                <p className="text-muted-foreground text-xs">Sekali bayar</p>
              ) : (
                <div className="flex flex-wrap gap-1 pt-1">
                  {data.bulanTagihan.map((b) => (
                    <Badge key={b} variant="secondary" className="text-xs">
                      {b} {data.tahunTagihan}
                    </Badge>
                  ))}
                </div>
              )}
              {!isSekali && data.bulanTagihan.length > 1 && (
                <p className="mt-1 text-muted-foreground text-xs">
                  {formatRupiah(data.nominal)} × {data.bulanTagihan.length} bulan
                </p>
              )}
            </div>

            <Separator className="my-3" />

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg bg-blue-600 px-4 py-3">
              <span className="font-bold text-sm text-white">TOTAL DIBAYAR</span>
              <span className="font-bold text-lg text-white tabular-nums">{formatRupiah(data.totalDibayar)}</span>
            </div>

            {/* Keterangan */}
            {data.keterangan && (
              <p className="mt-3 rounded border-blue-400 border-l-2 bg-blue-50 px-3 py-2 text-muted-foreground text-xs dark:bg-blue-950/30">
                {data.keterangan}
              </p>
            )}

            <p className="mt-4 text-center text-muted-foreground text-xs">
              Kuitansi ini diterbitkan secara elektronik oleh sistem Kas RT.
              <br />
              Berlaku tanpa tanda tangan basah.
            </p>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <XIcon className="mr-2 h-4 w-4" />
            Tutup
          </Button>
          <Button onClick={handleDownloadPDF} disabled={downloading}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            {downloading ? "Mengunduh..." : "Unduh PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
