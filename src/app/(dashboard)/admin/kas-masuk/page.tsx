"use client";

import { useState } from "react";

import { EKuitansiDialog } from "./_components/e-kuitansi-dialog";
import { PaymentForm } from "./_components/payment-form";
import { TodayHistory } from "./_components/today-history";

interface PaymentResult {
  refNumber: string;
  wargaData: { namaKepalaKeluarga: string; blokRumah: string };
  kategoriData: { namaKategori: string };
  inserted: { id: number; bulanTagihan: string | null; nominal: number }[];
  tahunTagihan: number;
  bulanTagihan: string[];
}

export default function KasMasukPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [kuitansi, setKuitansi] = useState<{
    refNumber: string;
    wargaData: { namaKepalaKeluarga: string; blokRumah: string };
    kategoriData: { namaKategori: string };
    bulanTagihan: string[];
    tahunTagihan: number;
    nominal: number;
    tanggal: Date;
  } | null>(null);
  const [kuitansiOpen, setKuitansiOpen] = useState(false);

  function handleSuccess(result: PaymentResult) {
    const nominal = result.inserted[0]?.nominal ?? 0;
    setKuitansi({
      refNumber: result.refNumber,
      wargaData: result.wargaData,
      kategoriData: result.kategoriData,
      bulanTagihan: result.bulanTagihan,
      tahunTagihan: result.tahunTagihan,
      nominal,
      tanggal: new Date(),
    });
    setKuitansiOpen(true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Kas Masuk</h1>
        <p className="text-muted-foreground text-sm">Catat pembayaran iuran warga.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PaymentForm onSuccess={handleSuccess} />
        <TodayHistory refreshKey={refreshKey} />
      </div>

      <EKuitansiDialog open={kuitansiOpen} onOpenChange={setKuitansiOpen} data={kuitansi} />
    </div>
  );
}
