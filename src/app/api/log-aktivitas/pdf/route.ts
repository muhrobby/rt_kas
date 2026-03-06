import React from "react";

import type { NextRequest } from "next/server";

import { renderToBuffer } from "@react-pdf/renderer";

import { requireAdmin } from "@/lib/auth-helpers";
import { LogAktivitasPDF } from "@/lib/pdf/log-aktivitas-template";
import { getAdminList, getLogList } from "@/server/actions/log-aktivitas";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const tanggalMulai = searchParams.get("tanggalMulai") ?? undefined;
  const tanggalAkhir = searchParams.get("tanggalAkhir") ?? undefined;
  const modul = searchParams.get("modul") ?? undefined;
  const aksi = searchParams.get("aksi") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;

  const [rows, admins] = await Promise.all([
    getLogList({ tanggalMulai, tanggalAkhir, modul, aksi, userId }),
    getAdminList(),
  ]);

  const adminMap = new Map(admins.map((a) => [a.id, a.name]));

  const data = rows.map((r) => ({
    id: r.id,
    waktuLog: r.waktuLog,
    petugasName: adminMap.get(r.userId) ?? r.userId,
    modul: r.modul,
    aksi: r.aksi,
    keterangan: r.keterangan,
  }));

  const generatedAt = new Date().toLocaleString("id-ID");

  // biome-ignore lint/suspicious/noExplicitAny: @react-pdf/renderer typing requires any cast here
  const element = React.createElement(LogAktivitasPDF, { data, generatedAt }) as any;
  const pdfBuffer = await renderToBuffer(element);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Log-Aktivitas.pdf"',
    },
  });
}
