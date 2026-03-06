"use server";

import { revalidatePath } from "next/cache";

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import type { KasKeluarFormValues } from "@/lib/validations/kas-keluar";

import { logActivity } from "./audit";

export async function createPengeluaran(data: KasKeluarFormValues) {
  const session = await requireAdmin();

  const [kategoriData] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, data.kategoriId));
  if (!kategoriData) throw new Error("Kategori tidak ditemukan");

  const [inserted] = await db
    .insert(transaksi)
    .values({
      userId: session.user.id,
      wargaId: null,
      kategoriId: data.kategoriId,
      nominal: data.nominal,
      tipeArus: "keluar" as const,
      keterangan: data.keterangan,
      waktuTransaksi: new Date(data.tanggal),
    })
    .returning();

  await logActivity({
    userId: session.user.id,
    modul: "Kas Keluar",
    aksi: "tambah",
    keterangan: `Mencatat pengeluaran ${kategoriData.namaKategori} Rp ${data.nominal.toLocaleString("id-ID")}: ${data.keterangan}`,
  });

  revalidatePath("/admin/kas-keluar");
  return inserted;
}

export async function getRecentPengeluaran(limitDays = 30) {
  await requireAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - limitDays);

  return db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      keterangan: transaksi.keterangan,
      namaKategori: kategoriKas.namaKategori,
    })
    .from(transaksi)
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(and(eq(transaksi.tipeArus, "keluar"), gte(transaksi.waktuTransaksi, cutoff)))
    .orderBy(desc(transaksi.waktuTransaksi))
    .limit(50);
}

export async function getTotalPengeluaranBulanIni() {
  await requireAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(and(eq(transaksi.tipeArus, "keluar"), gte(transaksi.waktuTransaksi, startOfMonth)));
  return result?.total ?? 0;
}
