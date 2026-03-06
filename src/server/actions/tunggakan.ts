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
  tahunTagihan: number;
  bulanTagihan: string;
  kategoriId: number;
}

/**
 * Returns list of warga who have NOT paid for a given bulan + tahun + kategori.
 * Query: all warga LEFT JOIN transaksi masuk on (wargaId + kategoriId + bulan + tahun),
 * then filter where transaksi.id IS NULL.
 */
export async function getTunggakan(filters: TunggakanFilters): Promise<TunggakanRow[]> {
  await requireAdmin();

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
    .leftJoin(
      transaksi,
      and(
        eq(transaksi.wargaId, warga.id),
        eq(transaksi.kategoriId, filters.kategoriId),
        eq(transaksi.bulanTagihan, filters.bulanTagihan),
        eq(transaksi.tahunTagihan, filters.tahunTagihan),
        eq(transaksi.tipeArus, "masuk"),
      ),
    )
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
 * Returns all kategori masuk for the filter selector.
 */
export async function getKategoriMasukForSelect() {
  await requireAdmin();
  return db
    .select({ id: kategoriKas.id, namaKategori: kategoriKas.namaKategori })
    .from(kategoriKas)
    .where(eq(kategoriKas.jenisArus, "masuk"))
    .orderBy(kategoriKas.namaKategori);
}
