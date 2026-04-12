"use server";

import { revalidatePath } from "next/cache";

import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { generateRefNumber } from "@/lib/utils";
import { type KasMasukFormValues, kasMasukFormSchema } from "@/lib/validations/kas-masuk";

import { logActivity } from "./audit";

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505"
  );
}

export async function createPembayaran(data: KasMasukFormValues) {
  const session = await requireAdmin();
  const parsed = kasMasukFormSchema.parse(data);

  interface CreatePembayaranResult {
    inserted: (typeof transaksi.$inferSelect)[];
    wargaData: typeof warga.$inferSelect;
    kategoriData: typeof kategoriKas.$inferSelect;
    activityText: string;
  }

  let result: CreatePembayaranResult;

  try {
    result = await db.transaction(async (tx) => {
      const [wargaData] = await tx.select().from(warga).where(eq(warga.id, parsed.wargaId));
      const [kategoriData] = await tx.select().from(kategoriKas).where(eq(kategoriKas.id, parsed.kategoriId));

      if (!wargaData || !kategoriData) throw new Error("Data tidak valid");

      const isSekali = parsed.bulanTagihan.length === 0;

      if (isSekali) {
        const [existingSekali] = await tx
          .select({ id: transaksi.id })
          .from(transaksi)
          .where(
            and(
              eq(transaksi.wargaId, parsed.wargaId),
              eq(transaksi.kategoriId, parsed.kategoriId),
              eq(transaksi.tipeArus, "masuk"),
              isNull(transaksi.bulanTagihan),
              isNull(transaksi.tahunTagihan),
            ),
          )
          .limit(1);

        if (existingSekali) {
          throw new Error(
            `${wargaData.namaKepalaKeluarga} sudah membayar ${kategoriData.namaKategori} (sekali bayar) sebelumnya`,
          );
        }

        const [inserted] = await tx
          .insert(transaksi)
          .values({
            userId: session.user.id,
            wargaId: parsed.wargaId,
            kategoriId: parsed.kategoriId,
            bulanTagihan: null,
            tahunTagihan: null,
            nominal: parsed.nominal,
            tipeArus: "masuk" as const,
            keterangan: parsed.keterangan ?? `${kategoriData.namaKategori} — ${wargaData.namaKepalaKeluarga}`,
          })
          .returning();

        if (!inserted) throw new Error("Gagal menyimpan transaksi");

        return {
          inserted: [inserted],
          wargaData,
          kategoriData,
          activityText: `Mencatat iuran ${kategoriData.namaKategori} Rp ${parsed.nominal.toLocaleString("id-ID")} (sekali bayar) untuk ${wargaData.namaKepalaKeluarga} (${wargaData.blokRumah})`,
        };
      }

      const existing = await tx
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

      const inserted = await tx
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
      return {
        inserted,
        wargaData,
        kategoriData,
        activityText: `Mencatat iuran ${kategoriData.namaKategori} Rp ${parsed.nominal.toLocaleString("id-ID")} untuk ${wargaData.namaKepalaKeluarga} (${wargaData.blokRumah}) bulan ${bulanStr} ${parsed.tahunTagihan}`,
      };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("Pembayaran duplikat terdeteksi untuk kategori dan periode yang sama.");
    }
    throw error;
  }

  await logActivity({
    userId: session.user.id,
    modul: "Kas Masuk",
    aksi: "tambah",
    keterangan: result.activityText,
  });

  revalidatePath("/admin/kas-masuk");

  return {
    inserted: result.inserted,
    refNumber: generateRefNumber(),
    wargaData: result.wargaData,
    kategoriData: result.kategoriData,
  };
}

export async function getRecentPemasukan() {
  await requireAdmin();

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
    .where(eq(transaksi.tipeArus, "masuk"))
    .orderBy(desc(transaksi.waktuTransaksi))
    .limit(50);
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
 * Returns the previous payment records for a sekali-bayar kategori.
 * Used by the payment form to warn the user that this warga has already paid.
 */
export async function getSekaliPaidHistory(wargaId: number, kategoriId: number) {
  await requireAdmin();
  if (!wargaId || !kategoriId) return [];
  return db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      keterangan: transaksi.keterangan,
    })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.kategoriId, kategoriId), eq(transaksi.tipeArus, "masuk")))
    .orderBy(desc(transaksi.waktuTransaksi));
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
