"use server";

import { and, asc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAuth } from "@/lib/auth-helpers";
import { BULAN_NAMES } from "@/lib/utils";

export interface LaporanTransaksiItem {
  id: number;
  waktuTransaksi: Date;
  tipeArus: "masuk" | "keluar";
  nominal: number;
  namaKategori: string;
  keterangan: string | null;
  namaWarga: string | null;
  blokRumah: string | null;
}

export interface LaporanPeriodOption {
  bulan: number;
  tahun: number;
  label: string;
}

export async function getWargaSaldoKas(): Promise<number> {
  await requireAuth();

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

export async function getWargaRekapTahun(tahun?: number): Promise<{ totalMasuk: number; totalKeluar: number }> {
  await requireAuth();

  const now = new Date();
  const resolvedTahun = tahun ?? now.getFullYear();
  const startDate = new Date(resolvedTahun, 0, 1);
  const endDate = new Date(resolvedTahun + 1, 0, 1); // exclusive

  const [masuk] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "masuk"),
        gte(transaksi.waktuTransaksi, startDate),
        lt(transaksi.waktuTransaksi, endDate),
      ),
    );

  const [keluar] = await db
    .select({ total: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "keluar"),
        gte(transaksi.waktuTransaksi, startDate),
        lt(transaksi.waktuTransaksi, endDate),
      ),
    );

  return { totalMasuk: masuk?.total ?? 0, totalKeluar: keluar?.total ?? 0 };
}

export async function getWargaMonthlyChartData(
  tahun: number,
): Promise<{ bulan: number; masuk: number; keluar: number }[]> {
  await requireAuth();

  const startDate = new Date(tahun, 0, 1);
  const endDate = new Date(tahun + 1, 0, 1);

  const rows = await db
    .select({
      bulan: sql<number>`extract(month from ${transaksi.waktuTransaksi})::int`,
      tipeArus: transaksi.tipeArus,
      total: sql<number>`sum(${transaksi.nominal})::int`,
    })
    .from(transaksi)
    .where(and(gte(transaksi.waktuTransaksi, startDate), lt(transaksi.waktuTransaksi, endDate)))
    .groupBy(sql`extract(month from ${transaksi.waktuTransaksi})`, transaksi.tipeArus);

  return Array.from({ length: 12 }, (_, i) => {
    const bulan = i + 1;
    const masuk = rows.find((r) => r.bulan === bulan && r.tipeArus === "masuk")?.total ?? 0;
    const keluar = rows.find((r) => r.bulan === bulan && r.tipeArus === "keluar")?.total ?? 0;
    return { bulan, masuk, keluar };
  });
}

export async function getWargaPengeluaranBulan(bulan: number, tahun: number): Promise<LaporanTransaksiItem[]> {
  await requireAuth();

  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 1); // exclusive

  const rows = await db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      tipeArus: transaksi.tipeArus,
      nominal: transaksi.nominal,
      namaKategori: kategoriKas.namaKategori,
      keterangan: transaksi.keterangan,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
    })
    .from(transaksi)
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .where(
      and(
        eq(transaksi.tipeArus, "keluar"), // ONLy show expense details to Warga!
        gte(transaksi.waktuTransaksi, startDate),
        lt(transaksi.waktuTransaksi, endDate),
      ),
    )
    .orderBy(asc(transaksi.waktuTransaksi));

  return rows.map((r) => ({
    id: r.id,
    waktuTransaksi: r.waktuTransaksi,
    tipeArus: r.tipeArus, // always 'keluar'
    nominal: r.nominal,
    namaKategori: r.namaKategori ?? "-",
    keterangan: r.keterangan,
    namaWarga: r.namaWarga,
    blokRumah: r.blokRumah,
  }));
}

export async function getAvailableLaporanYears(): Promise<number[]> {
  await requireAuth();

  const now = new Date();
  const currentTahun = now.getFullYear();

  const rows = await db
    .selectDistinct({
      tahun: sql<number>`extract(year from ${transaksi.waktuTransaksi})::int`,
    })
    .from(transaksi);

  const years: number[] = rows.filter((r): r is { tahun: number } => r.tahun !== null).map((r) => r.tahun);

  if (!years.includes(currentTahun)) {
    years.push(currentTahun);
  }

  // Deduplicate and sort descending
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);

  return uniqueYears;
}
