"use server";

import { revalidatePath } from "next/cache";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { generateRefNumber } from "@/lib/utils";
import type { KasMasukFormValues } from "@/lib/validations/kas-masuk";

import { logActivity } from "./audit";

export async function createPembayaran(data: KasMasukFormValues) {
  const session = await requireAdmin();

  const [wargaData] = await db.select().from(warga).where(eq(warga.id, data.wargaId));
  const [kategoriData] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, data.kategoriId));

  if (!wargaData || !kategoriData) throw new Error("Data tidak valid");

  // Insert one transaction per selected month
  const inserted = await db
    .insert(transaksi)
    .values(
      data.bulanTagihan.map((bulan) => ({
        userId: session.user.id,
        wargaId: data.wargaId,
        kategoriId: data.kategoriId,
        bulanTagihan: bulan,
        tahunTagihan: data.tahunTagihan,
        nominal: data.nominal,
        tipeArus: "masuk" as const,
        keterangan: data.keterangan ?? `Iuran ${kategoriData.namaKategori} bulan ${bulan} ${data.tahunTagihan}`,
      })),
    )
    .returning();

  const bulanStr = data.bulanTagihan.join(", ");
  await logActivity({
    userId: session.user.id,
    modul: "Kas Masuk",
    aksi: "tambah",
    keterangan: `Mencatat iuran ${kategoriData.namaKategori} Rp ${data.nominal.toLocaleString("id-ID")} untuk ${wargaData.namaKepalaKeluarga} (${wargaData.blokRumah}) bulan ${bulanStr} ${data.tahunTagihan}`,
  });

  revalidatePath("/admin/kas-masuk");

  return { inserted, refNumber: generateRefNumber(), wargaData, kategoriData };
}

export async function getTodayPemasukan() {
  await requireAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      keterangan: transaksi.keterangan,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      namaKategori: kategoriKas.namaKategori,
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(
      and(
        eq(transaksi.tipeArus, "masuk"),
        gte(transaksi.waktuTransaksi, today),
        lte(transaksi.waktuTransaksi, tomorrow),
      ),
    )
    .orderBy(desc(transaksi.waktuTransaksi));
}

export async function getPembayaranDetail(id: number) {
  await requireAdmin();
  const [result] = await db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      keterangan: transaksi.keterangan,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      namaKategori: kategoriKas.namaKategori,
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(eq(transaksi.id, id));
  return result ?? null;
}

export async function getTotalPemasukanBulanIni() {
  await requireAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(and(eq(transaksi.tipeArus, "masuk"), gte(transaksi.waktuTransaksi, startOfMonth)));
  return result?.total ?? 0;
}
