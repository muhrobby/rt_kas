"use server";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, warga } from "@/db/schema";
import { requireAuth, requireWarga } from "@/lib/auth-helpers";

export interface WargaProfile {
  id: number;
  namaKepalaKeluarga: string;
  blokRumah: string;
  noTelp: string;
  statusHunian: "tetap" | "kontrak";
  tglBatasDomisili: string | null;
}

export interface BillingStatusItem {
  kategoriId: number;
  namaKategori: string;
  nominalDefault: number;
  lunas: boolean;
  transaksiId: number | null;
}

export async function getWargaProfile(): Promise<WargaProfile | null> {
  const session = await requireAuth();

  // Use wargaId from auth user if set
  const wargaId = (session.user as { wargaId?: number | null }).wargaId;
  if (wargaId) {
    const [row] = await db.select().from(warga).where(eq(warga.id, wargaId)).limit(1);
    if (!row) return null;
    return {
      id: row.id,
      namaKepalaKeluarga: row.namaKepalaKeluarga,
      blokRumah: row.blokRumah,
      noTelp: row.noTelp,
      statusHunian: row.statusHunian,
      tglBatasDomisili: row.tglBatasDomisili ?? null,
    };
  }

  // Fallback: match by phone (username = phone number in Better Auth username plugin)
  const username = (session.user as { username?: string | null }).username ?? "";
  if (!username) return null;

  const [row] = await db.select().from(warga).where(eq(warga.noTelp, username)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    namaKepalaKeluarga: row.namaKepalaKeluarga,
    blokRumah: row.blokRumah,
    noTelp: row.noTelp,
    statusHunian: row.statusHunian,
    tglBatasDomisili: row.tglBatasDomisili ?? null,
  };
}

export async function getKasBalance(): Promise<number> {
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

export async function getBillingStatus(month: number, year: number): Promise<BillingStatusItem[]> {
  const { wargaId } = await requireWarga();

  const categories = await db.select().from(kategoriKas).where(eq(kategoriKas.jenisArus, "masuk"));

  const payments = await db
    .select({ id: transaksi.id, kategoriId: transaksi.kategoriId })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, wargaId),
        eq(transaksi.tipeArus, "masuk"),
        eq(transaksi.bulanTagihan, String(month)),
        eq(transaksi.tahunTagihan, year),
      ),
    );

  return categories.map((kat) => {
    const paid = payments.find((p) => p.kategoriId === kat.id);
    return {
      kategoriId: kat.id,
      namaKategori: kat.namaKategori,
      nominalDefault: kat.nominalDefault,
      lunas: !!paid,
      transaksiId: paid?.id ?? null,
    };
  });
}
