import React from "react";

import type { NextRequest } from "next/server";

import { renderToBuffer } from "@react-pdf/renderer";

import { requireAdmin } from "@/lib/auth-helpers";
import { KuitansiPDF } from "@/lib/pdf/kuitansi-template";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);

  const refNumber = searchParams.get("ref") ?? "";
  const tanggal = searchParams.get("tanggal") ?? new Date().toISOString();
  const wargaNama = searchParams.get("wargaNama") ?? "";
  const wargaBlok = searchParams.get("wargaBlok") ?? "";
  const namaKategori = searchParams.get("namaKategori") ?? "";
  const bulanTagihanRaw = searchParams.get("bulanTagihan") ?? "";
  const tahunTagihanRaw = searchParams.get("tahunTagihan");
  const nominal = Number(searchParams.get("nominal") ?? "0");
  const totalDibayar = Number(searchParams.get("totalDibayar") ?? "0");
  const keterangan = searchParams.get("keterangan") ?? null;

  if (!refNumber || !wargaNama || !namaKategori) {
    return new Response("Parameter tidak lengkap", { status: 400 });
  }

  const bulanTagihan = bulanTagihanRaw ? bulanTagihanRaw.split(",").filter(Boolean) : [];
  const tahunTagihan = tahunTagihanRaw ? Number(tahunTagihanRaw) : null;

  const element = React.createElement(KuitansiPDF, {
    refNumber,
    tanggal: new Date(tanggal),
    wargaNama,
    wargaBlok,
    namaKategori,
    bulanTagihan,
    tahunTagihan,
    nominal,
    totalDibayar,
    keterangan,
    // biome-ignore lint/suspicious/noExplicitAny: @react-pdf/renderer requires any cast
  }) as any;

  const pdfBuffer = await renderToBuffer(element);

  const safeName = `${refNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
