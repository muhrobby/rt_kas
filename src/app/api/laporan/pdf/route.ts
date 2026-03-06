import React from "react";

import type { NextRequest } from "next/server";

import { renderToBuffer } from "@react-pdf/renderer";

import { requireAdmin } from "@/lib/auth-helpers";
import { LaporanPDF } from "@/lib/pdf/laporan-template";
import { getRekapKas } from "@/server/actions/laporan";

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

  const element = React.createElement(LaporanPDF, {
    data,
    bulanAwal,
    bulanAkhir,
    tahun,
    // biome-ignore lint/suspicious/noExplicitAny: @react-pdf/renderer requires any cast
  }) as any;
  const pdfBuffer = await renderToBuffer(element);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Laporan-Kas-RT-${bulanAwal}-${bulanAkhir}-${tahun}.pdf"`,
    },
  });
}
