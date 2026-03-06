import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth-helpers";
import { generateExcelBuffer } from "@/lib/excel/export-helpers";
import { getRekapKas } from "@/server/actions/laporan";

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const bulanAwal = Number(searchParams.get("bulanAwal") ?? "1");
  const bulanAkhir = Number(searchParams.get("bulanAkhir") ?? "12");
  const tahun = Number(searchParams.get("tahun") ?? new Date().getFullYear());

  if (!bulanAwal || !bulanAkhir || !tahun) {
    return new Response("Parameter tidak lengkap", { status: 400 });
  }

  const data = await getRekapKas(bulanAwal, bulanAkhir, tahun);

  const periodLabel =
    bulanAwal === bulanAkhir
      ? `${BULAN_NAMES[bulanAwal - 1]} ${tahun}`
      : `${BULAN_NAMES[bulanAwal - 1]} - ${BULAN_NAMES[bulanAkhir - 1]} ${tahun}`;

  const buffer = await generateExcelBuffer({
    title: `Laporan Keuangan Kas RT - ${periodLabel}`,
    data: data.map((d, i) => ({
      no: i + 1,
      tanggal: new Date(d.waktuTransaksi).toLocaleDateString("id-ID"),
      uraian: d.keterangan ?? (d.namaWarga ? `${d.namaWarga} (${d.blokRumah})` : "-"),
      kategori: d.namaKategori ?? "-",
      pemasukan: d.tipeArus === "masuk" ? d.nominal : 0,
      pengeluaran: d.tipeArus === "keluar" ? d.nominal : 0,
    })),
    columns: [
      { header: "No", key: "no", width: 6 },
      { header: "Tanggal", key: "tanggal", width: 14 },
      { header: "Uraian", key: "uraian", width: 42 },
      { header: "Kategori", key: "kategori", width: 20 },
      { header: "Pemasukan (Rp)", key: "pemasukan", width: 18 },
      { header: "Pengeluaran (Rp)", key: "pengeluaran", width: 18 },
    ],
    sheetName: "Laporan Kas RT",
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Laporan-Kas-RT-${bulanAwal}-${bulanAkhir}-${tahun}.xlsx"`,
    },
  });
}
