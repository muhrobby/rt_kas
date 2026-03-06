"use server";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";

export interface TunggakanRow {
  wargaId: number;
  namaKepalaKeluarga: string;
  blokRumah: string;
  noTelp: string;
  statusHunian: string;
}

export interface TunggakanFilters {
  kategoriId: number;
  tipeTagihan: "bulanan" | "sekali";
  /** Only used when tipeTagihan === "bulanan" */
  tahunTagihan: number;
  /** Only used when tipeTagihan === "bulanan" */
  bulanTagihan: string;
}

/**
 * Returns list of warga who have NOT paid for a given kategori.
 *
 * For bulanan: joins on (wargaId + kategoriId + bulanTagihan + tahunTagihan).
 * For sekali:  joins on (wargaId + kategoriId) only — bulan/tahun are NULL for one-time payments.
 * Both cases use LEFT JOIN + WHERE transaksi.id IS NULL.
 */
export async function getTunggakan(filters: TunggakanFilters): Promise<TunggakanRow[]> {
  await requireAdmin();

  const joinCondition =
    filters.tipeTagihan === "sekali"
      ? and(
          eq(transaksi.wargaId, warga.id),
          eq(transaksi.kategoriId, filters.kategoriId),
          eq(transaksi.tipeArus, "masuk"),
          isNull(transaksi.bulanTagihan),
        )
      : and(
          eq(transaksi.wargaId, warga.id),
          eq(transaksi.kategoriId, filters.kategoriId),
          eq(transaksi.bulanTagihan, filters.bulanTagihan),
          eq(transaksi.tahunTagihan, filters.tahunTagihan),
          eq(transaksi.tipeArus, "masuk"),
        );

  const rows = await db
    .select({
      wargaId: warga.id,
      namaKepalaKeluarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      noTelp: warga.noTelp,
      statusHunian: warga.statusHunian,
      transaksiId: transaksi.id,
    })
    .from(warga)
    .leftJoin(transaksi, joinCondition)
    .where(isNull(transaksi.id))
    .orderBy(warga.blokRumah, warga.namaKepalaKeluarga);

  return rows.map((r) => ({
    wargaId: r.wargaId,
    namaKepalaKeluarga: r.namaKepalaKeluarga,
    blokRumah: r.blokRumah,
    noTelp: r.noTelp,
    statusHunian: r.statusHunian,
  }));
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
