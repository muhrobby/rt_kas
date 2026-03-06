"use server";

import { and, asc, eq, gte, lt, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";

export interface RekapItem {
  id: number;
  waktuTransaksi: Date;
  keterangan: string | null;
  tipeArus: "masuk" | "keluar";
  nominal: number;
  namaKategori: string | null;
  namaWarga: string | null;
  blokRumah: string | null;
  userId: string;
}

export async function getRekapKas(bulanAwal: number, bulanAkhir: number, tahun: number): Promise<RekapItem[]> {
  await requireAdmin();
  const startDate = new Date(tahun, bulanAwal - 1, 1);
  const endDate = new Date(tahun, bulanAkhir, 1); // exclusive upper bound

  return db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      keterangan: transaksi.keterangan,
      tipeArus: transaksi.tipeArus,
      nominal: transaksi.nominal,
      namaKategori: kategoriKas.namaKategori,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      userId: transaksi.userId,
    })
    .from(transaksi)
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .where(and(gte(transaksi.waktuTransaksi, startDate), lte(transaksi.waktuTransaksi, endDate)))
    .orderBy(asc(transaksi.waktuTransaksi));
}

export async function getRekapSummary(bulanAwal: number, bulanAkhir: number, tahun: number) {
  await requireAdmin();
  const startDate = new Date(tahun, bulanAwal - 1, 1);
  const endDate = new Date(tahun, bulanAkhir, 1);

  const [masuk] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "masuk"),
        gte(transaksi.waktuTransaksi, startDate),
        lte(transaksi.waktuTransaksi, endDate),
      ),
    );

  const [keluar] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "keluar"),
        gte(transaksi.waktuTransaksi, startDate),
        lte(transaksi.waktuTransaksi, endDate),
      ),
    );

  const totalMasuk = masuk?.total ?? 0;
  const totalKeluar = keluar?.total ?? 0;
  return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
}

export async function getSaldoKas() {
  await requireAdmin();
  const [masuk] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(eq(transaksi.tipeArus, "masuk"));

  const [keluar] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(eq(transaksi.tipeArus, "keluar"));

  return (masuk?.total ?? 0) - (keluar?.total ?? 0);
}

export async function getSaldoAwal(bulanAwal: number, tahun: number): Promise<number> {
  await requireAdmin();
  const cutoffDate = new Date(tahun, bulanAwal - 1, 1); // first day of bulanAwal

  const [masuk] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(and(eq(transaksi.tipeArus, "masuk"), lt(transaksi.waktuTransaksi, cutoffDate)));

  const [keluar] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(and(eq(transaksi.tipeArus, "keluar"), lt(transaksi.waktuTransaksi, cutoffDate)));

  return (masuk?.total ?? 0) - (keluar?.total ?? 0);
}

export async function getMonthlyChartData(tahun: number) {
  await requireAdmin();
  const startDate = new Date(tahun, 0, 1);
  const endDate = new Date(tahun + 1, 0, 1);

  const rows = await db
    .select({
      bulan: sql<number>`extract(month from ${transaksi.waktuTransaksi})::int`,
      tipeArus: transaksi.tipeArus,
      total: sql<number>`sum(${transaksi.nominal})::int`,
    })
    .from(transaksi)
    .where(and(gte(transaksi.waktuTransaksi, startDate), lte(transaksi.waktuTransaksi, endDate)))
    .groupBy(sql`extract(month from ${transaksi.waktuTransaksi})`, transaksi.tipeArus);

  // Build 12-month array
  return Array.from({ length: 12 }, (_, i) => {
    const bulan = i + 1;
    const masuk = rows.find((r) => r.bulan === bulan && r.tipeArus === "masuk")?.total ?? 0;
    const keluar = rows.find((r) => r.bulan === bulan && r.tipeArus === "keluar")?.total ?? 0;
    return { bulan, masuk, keluar };
  });
}
