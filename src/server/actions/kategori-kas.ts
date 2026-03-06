"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import type { KategoriFormValues } from "@/lib/validations/kategori-kas";

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
  const [newKategori] = await db
    .insert(kategoriKas)
    .values({
      namaKategori: data.namaKategori,
      jenisArus: data.jenisArus,
      nominalDefault: data.nominalDefault,
    })
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Kategori Kas",
    aksi: "tambah",
    keterangan: `Menambahkan kategori kas baru: ${data.namaKategori} (${data.jenisArus})`,
  });
  revalidatePath("/admin/kategori-kas");
  return newKategori;
}

export async function updateKategori(id: number, data: KategoriFormValues) {
  const session = await requireAdmin();
  const [updated] = await db
    .update(kategoriKas)
    .set({
      namaKategori: data.namaKategori,
      jenisArus: data.jenisArus,
      nominalDefault: data.nominalDefault,
    })
    .where(eq(kategoriKas.id, id))
    .returning();
  await logActivity({
    userId: session.user.id,
    modul: "Kategori Kas",
    aksi: "edit",
    keterangan: `Mengubah kategori kas: ${data.namaKategori}`,
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
