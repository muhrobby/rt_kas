"use server";

import { revalidatePath } from "next/cache";

import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { transaksi, warga } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { type WargaFormValues, wargaFormSchema } from "@/lib/validations/warga";

import { logActivity } from "./audit";

export async function getWargaList(search?: string) {
  await requireAdmin();
  const conditions = search
    ? or(ilike(warga.namaKepalaKeluarga, `%${search}%`), ilike(warga.blokRumah, `%${search}%`))
    : undefined;
  return db.select().from(warga).where(conditions).orderBy(warga.blokRumah);
}

export async function getWargaById(id: number) {
  await requireAdmin();
  const [result] = await db.select().from(warga).where(eq(warga.id, id));
  return result ?? null;
}

export async function createWarga(data: WargaFormValues) {
  const session = await requireAdmin();
  const parsed = wargaFormSchema.parse(data);
  const [newWarga] = await db
    .insert(warga)
    .values({
      namaKepalaKeluarga: parsed.namaKepalaKeluarga,
      blokRumah: parsed.blokRumah,
      noTelp: parsed.noTelp,
      statusHunian: parsed.statusHunian,
      tglBatasDomisili: parsed.tglBatasDomisili ?? null,
    })
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Data Warga",
    aksi: "tambah",
    keterangan: `Menambahkan warga baru an. ${parsed.namaKepalaKeluarga} (${parsed.blokRumah})`,
  });
  revalidatePath("/admin/warga");
  return newWarga;
}

export async function updateWarga(id: number, data: WargaFormValues) {
  const session = await requireAdmin();
  const parsed = wargaFormSchema.parse(data);
  const [updated] = await db
    .update(warga)
    .set({
      namaKepalaKeluarga: parsed.namaKepalaKeluarga,
      blokRumah: parsed.blokRumah,
      noTelp: parsed.noTelp,
      statusHunian: parsed.statusHunian,
      tglBatasDomisili: parsed.tglBatasDomisili ?? null,
    })
    .where(eq(warga.id, id))
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Data Warga",
    aksi: "edit",
    keterangan: `Mengubah data warga an. ${parsed.namaKepalaKeluarga} (${parsed.blokRumah})`,
  });
  revalidatePath("/admin/warga");
  return updated;
}

export async function deleteWarga(id: number) {
  const session = await requireAdmin();
  const [existing] = await db.select().from(warga).where(eq(warga.id, id));
  if (!existing) throw new Error("Warga tidak ditemukan");
  await db.delete(warga).where(eq(warga.id, id));
  await logActivity({
    userId: session.user.id,
    modul: "Data Warga",
    aksi: "hapus",
    keterangan: `Menghapus data warga an. ${existing.namaKepalaKeluarga} (${existing.blokRumah})`,
  });
  revalidatePath("/admin/warga");
}

export async function getWargaForSelect() {
  await requireAdmin();
  return db
    .select({ id: warga.id, namaKepalaKeluarga: warga.namaKepalaKeluarga, blokRumah: warga.blokRumah })
    .from(warga)
    .orderBy(warga.blokRumah);
}

export async function getTagihanWarga(wargaId: number, tahun: number) {
  await requireAdmin();
  return db
    .select({ bulanTagihan: transaksi.bulanTagihan, kategoriId: transaksi.kategoriId })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.tahunTagihan, tahun), eq(transaksi.tipeArus, "masuk")));
}

// For upcoming domicile expiry warning (within 3 months)
export async function getWargaWithDomicileWarning() {
  await requireAdmin();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return db
    .select()
    .from(warga)
    .where(
      and(
        eq(warga.statusHunian, "kontrak"),
        gte(warga.tglBatasDomisili, new Date().toISOString().slice(0, 10)),
        lte(warga.tglBatasDomisili, threeMonthsFromNow.toISOString().slice(0, 10)),
      ),
    );
}

export async function getTotalWarga() {
  await requireAdmin();
  const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(warga);
  return result?.count ?? 0;
}
