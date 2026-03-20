import React from "react";

import type { NextRequest } from "next/server";

import { renderToBuffer } from "@react-pdf/renderer";

import { requireAdmin } from "@/lib/auth-helpers";
import { LaporanPDF } from "@/lib/pdf/laporan-template";
import { laporanParamsSchema } from "@/lib/validations/laporan";
import { getRekapKas } from "@/server/actions/laporan";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const rawBulanAwal = searchParams.get("bulanAwal") ?? "1";
  const rawBulanAkhir = searchParams.get("bulanAkhir") ?? "12";
  const rawTahun = searchParams.get("tahun") ?? String(new Date().getFullYear());

  const parsed = laporanParamsSchema.safeParse({
    bulanAwal: rawBulanAwal,
    bulanAkhir: rawBulanAkhir,
    tahun: rawTahun,
  });

  if (!parsed.success) {
    return new Response("Parameter tidak valid", { status: 400 });
  }

  const { bulanAwal, bulanAkhir, tahun } = parsed.data;

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
