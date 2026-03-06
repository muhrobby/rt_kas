"use server";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, user, warga } from "@/db/schema";
import { requireWarga } from "@/lib/auth-helpers";

export interface PaymentGridItem {
  bulan: number; // 1-12
  lunas: boolean;
  transaksiId: number | null;
  nominal: number | null;
  waktuTransaksi: Date | null;
  keterangan: string | null;
  refNumber: string | null;
}

export interface PaymentGridByKategori {
  kategoriId: number;
  namaKategori: string;
  nominalDefault: number;
  months: PaymentGridItem[];
}

export interface KuitansiDetail {
  id: number;
  waktuTransaksi: Date;
  namaWarga: string;
  blokRumah: string;
  namaKategori: string;
  bulanTagihan: string | null;
  tahunTagihan: number | null;
  nominal: number;
  keterangan: string | null;
  dicatatOleh: string;
}

export async function getPaymentGrid(tahun: number): Promise<PaymentGridByKategori[]> {
  const { wargaId } = await requireWarga();

  const categories = await db.select().from(kategoriKas).where(eq(kategoriKas.jenisArus, "masuk"));

  const payments = await db
    .select({
      id: transaksi.id,
      kategoriId: transaksi.kategoriId,
      bulanTagihan: transaksi.bulanTagihan,
      nominal: transaksi.nominal,
      waktuTransaksi: transaksi.waktuTransaksi,
      keterangan: transaksi.keterangan,
    })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.tipeArus, "masuk"), eq(transaksi.tahunTagihan, tahun)))
    .orderBy(asc(transaksi.waktuTransaksi));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  return categories.map((kat) => {
    const months: PaymentGridItem[] = Array.from({ length: 12 }, (_, i) => {
      const bulan = i + 1;
      const paid = payments.find((p) => p.kategoriId === kat.id && p.bulanTagihan === String(bulan));

      // Future months (current year only) shown as neutral
      const isFuture = tahun === currentYear && bulan > currentMonth;

      return {
        bulan,
        lunas: !!paid,
        transaksiId: paid?.id ?? null,
        nominal: paid?.nominal ?? null,
        waktuTransaksi: paid?.waktuTransaksi ?? null,
        keterangan: paid?.keterangan ?? null,
        refNumber: null, // fetched separately if needed
        isFuture,
      } as PaymentGridItem & { isFuture: boolean };
    });

    return {
      kategoriId: kat.id,
      namaKategori: kat.namaKategori,
      nominalDefault: kat.nominalDefault,
      months,
    };
  });
}

export async function getKuitansiDetail(transaksiId: number): Promise<KuitansiDetail | null> {
  const { wargaId } = await requireWarga();

  const rows = await db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      namaKategori: kategoriKas.namaKategori,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      nominal: transaksi.nominal,
      keterangan: transaksi.keterangan,
      userId: transaksi.userId,
      wargaId: transaksi.wargaId,
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(eq(transaksi.id, transaksiId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Verify this transaction belongs to the authenticated warga
  if (row.wargaId !== wargaId) {
    throw new Error("Unauthorized");
  }

  // Get the name of the admin who recorded
  const [adminUser] = await db.select({ name: user.name }).from(user).where(eq(user.id, row.userId)).limit(1);

  return {
    id: row.id,
    waktuTransaksi: row.waktuTransaksi,
    namaWarga: row.namaWarga ?? "-",
    blokRumah: row.blokRumah ?? "-",
    namaKategori: row.namaKategori ?? "-",
    bulanTagihan: row.bulanTagihan,
    tahunTagihan: row.tahunTagihan,
    nominal: row.nominal,
    keterangan: row.keterangan,
    dicatatOleh: adminUser?.name ?? "-",
  };
}

export async function getAvailableYears(): Promise<number[]> {
  const { wargaId } = await requireWarga();

  const rows = await db
    .selectDistinct({ tahun: transaksi.tahunTagihan })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.tipeArus, "masuk")));

  const years = rows
    .map((r) => r.tahun)
    .filter((y): y is number => y !== null)
    .sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.unshift(currentYear);

  return years;
}
