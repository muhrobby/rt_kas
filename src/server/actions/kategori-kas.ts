"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { type KategoriFormValues, kategoriFormSchema } from "@/lib/validations/kategori-kas";

import { logActivity } from "./audit";

export async function getKategoriList() {
  await requireAdmin();
  return db.select().from(kategoriKas).orderBy(kategoriKas.namaKategori);
}

export async function getKategoriByJenis(jenis: "masuk" | "keluar") {
  await requireAdmin();
  return db.select().from(kategoriKas).where(eq(kategoriKas.jenisArus, jenis)).orderBy(kategoriKas.namaKategori);
}

export async function getKategoriById(id: number) {
  await requireAdmin();
  const [result] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, id));
  return result ?? null;
}

export async function createKategori(data: KategoriFormValues) {
  const session = await requireAdmin();
  const parsed = kategoriFormSchema.parse(data);
  const [newKategori] = await db
    .insert(kategoriKas)
    .values({
      namaKategori: parsed.namaKategori,
      jenisArus: parsed.jenisArus,
      nominalDefault: parsed.nominalDefault,
      tipeTagihan: parsed.tipeTagihan,
    })
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Kategori Kas",
    aksi: "tambah",
    keterangan: `Menambahkan kategori kas baru: ${parsed.namaKategori} (${parsed.jenisArus})`,
  });
  revalidatePath("/admin/kategori-kas");
  return newKategori;
}

export async function updateKategori(id: number, data: KategoriFormValues) {
  const session = await requireAdmin();
  const parsed = kategoriFormSchema.parse(data);
  const [updated] = await db
    .update(kategoriKas)
    .set({
      namaKategori: parsed.namaKategori,
      jenisArus: parsed.jenisArus,
      nominalDefault: parsed.nominalDefault,
      tipeTagihan: parsed.tipeTagihan,
    })
    .where(eq(kategoriKas.id, id))
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Kategori Kas",
    aksi: "edit",
    keterangan: `Mengubah kategori kas: ${parsed.namaKategori}`,
  });
  revalidatePath("/admin/kategori-kas");
  return updated;
}

export async function deleteKategori(id: number) {
  const session = await requireAdmin();
  const [existing] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, id));
  if (!existing) throw new Error("Kategori tidak ditemukan");

  // Block deletion if referenced by transactions
  const [usage] = await db
    .select({ count: eq(transaksi.kategoriId, id) })
    .from(transaksi)
    .where(eq(transaksi.kategoriId, id))
    .limit(1);
  if (usage) throw new Error("Kategori ini sudah digunakan dalam transaksi dan tidak bisa dihapus");

  await db.delete(kategoriKas).where(eq(kategoriKas.id, id));
  await logActivity({
    userId: session.user.id,
    modul: "Kategori Kas",
    aksi: "hapus",
    keterangan: `Menghapus kategori kas: ${existing.namaKategori}`,
  });
  revalidatePath("/admin/kategori-kas");
}
