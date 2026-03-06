"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { EKuitansiDialog } from "./_components/e-kuitansi-dialog";
import { PaymentForm } from "./_components/payment-form";
import { RecentHistory } from "./_components/recent-history";

interface PaymentResult {
  refNumber: string;
  wargaData: { namaKepalaKeluarga: string; blokRumah: string };
  kategoriData: { namaKategori: string };
  inserted: { id: number; bulanTagihan: string | null; nominal: number }[];
  tahunTagihan: number;
  bulanTagihan: string[];
}

export default function KasMasukPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kuitansi, setKuitansi] = useState<{
    refNumber: string;
    wargaData: { namaKepalaKeluarga: string; blokRumah: string };
    kategoriData: { namaKategori: string };
    bulanTagihan: string[];
    tahunTagihan: number;
    nominal: number;
    totalDibayar: number;
    keterangan?: string | null;
    tanggal: Date;
  } | null>(null);
  const [kuitansiOpen, setKuitansiOpen] = useState(false);

  function handleSuccess(result: PaymentResult) {
    const nominal = result.inserted[0]?.nominal ?? 0;
    const totalDibayar = result.bulanTagihan.length > 0 ? nominal * result.bulanTagihan.length : nominal;
    setDialogOpen(false);
    setKuitansi({
      refNumber: result.refNumber,
      wargaData: result.wargaData,
      kategoriData: result.kategoriData,
      bulanTagihan: result.bulanTagihan,
      tahunTagihan: result.tahunTagihan,
      nominal,
      totalDibayar,
      tanggal: new Date(),
    });
    setKuitansiOpen(true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Kas Masuk</h1>
          <p className="text-muted-foreground text-sm">Catat pembayaran iuran warga.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Pembayaran Iuran Warga</DialogTitle>
            </DialogHeader>
            <PaymentForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <RecentHistory refreshKey={refreshKey} />

      <EKuitansiDialog open={kuitansiOpen} onOpenChange={setKuitansiOpen} data={kuitansi} />
    </div>
  );
}
