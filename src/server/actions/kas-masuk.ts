"use server";

import { revalidatePath } from "next/cache";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { generateRefNumber } from "@/lib/utils";
import { type KasMasukFormValues, kasMasukFormSchema } from "@/lib/validations/kas-masuk";

import { logActivity } from "./audit";

export async function createPembayaran(data: KasMasukFormValues) {
  const session = await requireAdmin();
  const parsed = kasMasukFormSchema.parse(data);

  const [wargaData] = await db.select().from(warga).where(eq(warga.id, parsed.wargaId));
  const [kategoriData] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, parsed.kategoriId));

  if (!wargaData || !kategoriData) throw new Error("Data tidak valid");

  // Check for duplicate: find which selected months already have a record
  const existing = await db
    .select({ bulanTagihan: transaksi.bulanTagihan })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, parsed.wargaId),
        eq(transaksi.kategoriId, parsed.kategoriId),
        eq(transaksi.tahunTagihan, parsed.tahunTagihan),
        eq(transaksi.tipeArus, "masuk"),
        inArray(transaksi.bulanTagihan, parsed.bulanTagihan),
      ),
    );

  if (existing.length > 0) {
    const duplicateBulans = existing.map((e) => e.bulanTagihan).join(", ");
    throw new Error(
      `${wargaData.namaKepalaKeluarga} sudah membayar ${kategoriData.namaKategori} untuk bulan: ${duplicateBulans} tahun ${parsed.tahunTagihan}`,
    );
  }

  // Insert one transaction per selected month
  const inserted = await db
    .insert(transaksi)
    .values(
      parsed.bulanTagihan.map((bulan) => ({
        userId: session.user.id,
        wargaId: parsed.wargaId,
        kategoriId: parsed.kategoriId,
        bulanTagihan: bulan,
        tahunTagihan: parsed.tahunTagihan,
        nominal: parsed.nominal,
        tipeArus: "masuk" as const,
        keterangan: parsed.keterangan ?? `Iuran ${kategoriData.namaKategori} bulan ${bulan} ${parsed.tahunTagihan}`,
      })),
    )
    .returning();

  const bulanStr = parsed.bulanTagihan.join(", ");
  await logActivity({
    userId: session.user.id,
    modul: "Kas Masuk",
    aksi: "tambah",
    keterangan: `Mencatat iuran ${kategoriData.namaKategori} Rp ${parsed.nominal.toLocaleString("id-ID")} untuk ${wargaData.namaKepalaKeluarga} (${wargaData.blokRumah}) bulan ${bulanStr} ${parsed.tahunTagihan}`,
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

/**
 * Returns the list of months that a warga has already paid for a given kategori + tahun.
 * Used by the payment form to disable already-paid months in the MonthSelector.
 */
export async function getAlreadyPaidBulans(wargaId: number, kategoriId: number, tahunTagihan: number) {
  await requireAdmin();
  if (!wargaId || !kategoriId || !tahunTagihan) return [];
  const rows = await db
    .select({ bulanTagihan: transaksi.bulanTagihan })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, wargaId),
        eq(transaksi.kategoriId, kategoriId),
        eq(transaksi.tahunTagihan, tahunTagihan),
        eq(transaksi.tipeArus, "masuk"),
      ),
    );
  return rows.map((r) => r.bulanTagihan).filter((b): b is string => b !== null);
}
