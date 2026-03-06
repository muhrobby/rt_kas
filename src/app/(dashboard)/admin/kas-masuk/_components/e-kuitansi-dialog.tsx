"use client";

import { PrinterIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatRupiah, formatTanggal } from "@/lib/utils";

interface EKuitansiData {
  refNumber: string;
  wargaData: { namaKepalaKeluarga: string; blokRumah: string };
  kategoriData: { namaKategori: string };
  bulanTagihan: string[];
  tahunTagihan: number;
  nominal: number;
  tanggal: Date;
}

interface EKuitansiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EKuitansiData | null;
}

export function EKuitansiDialog({ open, onOpenChange, data }: EKuitansiDialogProps) {
  if (!data) return null;

  function handlePrint() {
    window.print();
  }

  const totalNominal = data.nominal * data.bulanTagihan.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">E-Kuitansi Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border p-4 print:border-0">
          <div className="mb-4 text-center">
            <div className="font-bold text-lg">KAS RT</div>
            <div className="text-muted-foreground text-xs">Sistem Manajemen Keuangan RT</div>
          </div>

          <Separator className="my-3" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Ref</span>
              <span className="font-medium font-mono">{data.refNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span>{formatTanggal(data.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warga</span>
              <span className="text-right">
                {data.wargaData.namaKepalaKeluarga}
                <span className="block text-muted-foreground text-xs">Blok {data.wargaData.blokRumah}</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori</span>
              <span>{data.kategoriData.namaKategori}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Bulan Tagihan</span>
              <div className="flex flex-wrap justify-end gap-1">
                {data.bulanTagihan.map((b) => (
                  <Badge key={b} variant="secondary" className="text-xs">
                    {b} {data.tahunTagihan}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nominal / bulan</span>
              <span>{formatRupiah(data.nominal)}</span>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between">
            <span className="font-semibold">Total Dibayar</span>
            <span className="font-bold text-green-600 text-lg">{formatRupiah(totalNominal)}</span>
          </div>

          <p className="mt-4 text-center text-muted-foreground text-xs">
            Kuitansi ini diterbitkan secara elektronik oleh sistem Kas RT.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <XIcon className="mr-2 h-4 w-4" />
            Tutup
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
