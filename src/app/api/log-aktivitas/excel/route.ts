import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth-helpers";
import { generateExcelBuffer } from "@/lib/excel/export-helpers";
import { getAdminList, getLogList } from "@/server/actions/log-aktivitas";

const AKSI_LABEL: Record<string, string> = {
  tambah: "Tambah",
  edit: "Edit",
  hapus: "Hapus",
  login: "Login",
  logout: "Logout",
};

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

  const buffer = await generateExcelBuffer({
    title: "Log Aktivitas Admin — Sistem Kas RT",
    data: rows.map((r, i) => ({
      no: i + 1,
      waktu: new Date(r.waktuLog).toLocaleString("id-ID"),
      petugas: adminMap.get(r.userId) ?? r.userId,
      modul: r.modul,
      aksi: AKSI_LABEL[r.aksi] ?? r.aksi,
      keterangan: r.keterangan,
    })),
    columns: [
      { header: "No", key: "no", width: 6 },
      { header: "Waktu", key: "waktu", width: 20 },
      { header: "Petugas", key: "petugas", width: 24 },
      { header: "Modul", key: "modul", width: 18 },
      { header: "Aksi", key: "aksi", width: 10 },
      { header: "Deskripsi", key: "keterangan", width: 50 },
    ],
    sheetName: "Log Aktivitas",
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Log-Aktivitas.xlsx"',
    },
  });
}
