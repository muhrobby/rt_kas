"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { getPeriodsInRange } from "@/lib/utils";

export interface TunggakanRow {
  wargaId: number;
  namaKepalaKeluarga: string;
  blokRumah: string;
  noTelp: string;
  statusHunian: string;
  totalBulanTunggakan: number;
  sumNominalTunggakan: number;
}

export interface TunggakanFilters {
  kategoriId: number;
  tipeTagihan: "bulanan" | "sekali";
  tahunMulai: number;
  bulanMulai: string;
  tahunAkhir: number;
  bulanAkhir: string;
}

/**
 * Returns list of warga who have unpaid bills for selected kategori.
 * - sekali: unpaid status is binary (paid/unpaid once)
 * - bulanan: unpaid is aggregated across a period range
 */
export async function getTunggakan(filters: TunggakanFilters): Promise<TunggakanRow[]> {
  await requireAdmin();

  const kategori = await db.query.kategoriKas.findFirst({
    where: eq(kategoriKas.id, filters.kategoriId),
  });

  if (!kategori) throw new Error("Kategori tidak ditemukan");

  if (filters.tipeTagihan === "sekali") {
    const joinConditionSekali = and(
      eq(transaksi.wargaId, warga.id),
      eq(transaksi.kategoriId, filters.kategoriId),
      eq(transaksi.tipeArus, "masuk"),
      isNull(transaksi.bulanTagihan),
    );

    const rows = await db
      .select({
        wargaId: warga.id,
        namaKepalaKeluarga: warga.namaKepalaKeluarga,
        blokRumah: warga.blokRumah,
        noTelp: warga.noTelp,
        statusHunian: warga.statusHunian,
      })
      .from(warga)
      .leftJoin(transaksi, joinConditionSekali)
      .where(and(isNull(transaksi.id), isNull(warga.tglPindah)))
      .orderBy(warga.blokRumah, warga.namaKepalaKeluarga);

    return rows.map((row) => ({
      ...row,
      totalBulanTunggakan: 1,
      sumNominalTunggakan: kategori.nominalDefault,
    }));
  }

  const periods = getPeriodsInRange(filters.bulanMulai, filters.tahunMulai, filters.bulanAkhir, filters.tahunAkhir);
  if (periods.length === 0) return [];

  const periodConditions = periods.map((period) =>
    and(eq(transaksi.bulanTagihan, period.bulan), eq(transaksi.tahunTagihan, period.tahun)),
  );

  const joinConditionBulanan = and(
    eq(transaksi.wargaId, warga.id),
    eq(transaksi.kategoriId, filters.kategoriId),
    eq(transaksi.tipeArus, "masuk"),
    or(...periodConditions),
  );

  const rows = await db
    .select({
      wargaId: warga.id,
      namaKepalaKeluarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      noTelp: warga.noTelp,
      statusHunian: warga.statusHunian,
      paidMonths: sql<number>`count(${transaksi.id})::int`,
    })
    .from(warga)
    .leftJoin(transaksi, joinConditionBulanan)
    .where(isNull(warga.tglPindah))
    .groupBy(warga.id, warga.namaKepalaKeluarga, warga.blokRumah, warga.noTelp, warga.statusHunian)
    .orderBy(warga.blokRumah, warga.namaKepalaKeluarga);

  const totalPeriods = periods.length;

  return rows
    .map((row) => {
      const totalBulanTunggakan = totalPeriods - row.paidMonths;
      return {
        wargaId: row.wargaId,
        namaKepalaKeluarga: row.namaKepalaKeluarga,
        blokRumah: row.blokRumah,
        noTelp: row.noTelp,
        statusHunian: row.statusHunian,
        totalBulanTunggakan,
        sumNominalTunggakan: totalBulanTunggakan * kategori.nominalDefault,
      };
    })
    .filter((row) => row.totalBulanTunggakan > 0);
}

/**
 * Returns all kategori masuk for the filter selector, including tipeTagihan.
 */
export async function getKategoriMasukForSelect() {
  await requireAdmin();
  return db
    .select({ id: kategoriKas.id, namaKategori: kategoriKas.namaKategori, tipeTagihan: kategoriKas.tipeTagihan })
    .from(kategoriKas)
    .where(eq(kategoriKas.jenisArus, "masuk"))
    .orderBy(kategoriKas.namaKategori);
}
