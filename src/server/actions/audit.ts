import { db } from "@/db";
import { logAktivitas } from "@/db/schema";

export type AuditModul = "Data Warga" | "Kategori Kas" | "Kas Masuk" | "Kas Keluar" | "Laporan" | "Login" | "Logout";

export type AuditAksi = "tambah" | "edit" | "hapus" | "login" | "logout";

interface LogActivityParams {
  userId: string;
  modul: AuditModul;
  aksi: AuditAksi;
  keterangan: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  await db.insert(logAktivitas).values({
    userId: params.userId,
    modul: params.modul,
    aksi: params.aksi,
    keterangan: params.keterangan,
  });
}
