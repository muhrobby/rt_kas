"use server";

import { revalidatePath } from "next/cache";

import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { transaksi, warga } from "@/db/schema";
import { account, user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-helpers";
import { type WargaFormValues, wargaFormSchema } from "@/lib/validations/warga";

import { logActivity } from "./audit";

function escapeIlike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export async function getWargaList(search?: string) {
  await requireAdmin();
  const conditions = search
    ? (() => {
        const safeSearch = escapeIlike(search);
        return or(ilike(warga.namaKepalaKeluarga, `%${safeSearch}%`), ilike(warga.blokRumah, `%${safeSearch}%`));
      })()
    : undefined;

  return db
    .select({
      id: warga.id,
      namaKepalaKeluarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      noTelp: warga.noTelp,
      statusHunian: warga.statusHunian,
      jumlahAnggota: warga.jumlahAnggota,
      tglBatasDomisili: warga.tglBatasDomisili,
      tglPindah: warga.tglPindah,
      createdAt: warga.createdAt,
      updatedAt: warga.updatedAt,
      isAdmin: sql<boolean>`CASE WHEN ${user.role} = 'admin' THEN true ELSE false END`.as("is_admin"),
    })
    .from(warga)
    .leftJoin(user, eq(user.wargaId, warga.id))
    .where(conditions)
    .orderBy(warga.blokRumah);
}

export async function getWargaById(id: number) {
  await requireAdmin();
  const [result] = await db
    .select({
      id: warga.id,
      namaKepalaKeluarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      noTelp: warga.noTelp,
      statusHunian: warga.statusHunian,
      jumlahAnggota: warga.jumlahAnggota,
      tglBatasDomisili: warga.tglBatasDomisili,
      tglPindah: warga.tglPindah,
      createdAt: warga.createdAt,
      updatedAt: warga.updatedAt,
      isAdmin: sql<boolean>`CASE WHEN ${user.role} = 'admin' THEN true ELSE false END`.as("is_admin"),
    })
    .from(warga)
    .leftJoin(user, eq(user.wargaId, warga.id))
    .where(eq(warga.id, id));
  return result ?? null;
}

export async function createWarga(data: WargaFormValues) {
  const session = await requireAdmin();
  const parsed = wargaFormSchema.parse(data);

  const result = await db.transaction(async (tx) => {
    // Check if username (noTelp) is already taken
    const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.username, parsed.noTelp));
    if (existingUser) {
      throw new Error(`Nomor telepon ${parsed.noTelp} sudah digunakan sebagai akun login`);
    }

    const [newWarga] = await tx
      .insert(warga)
      .values({
        namaKepalaKeluarga: parsed.namaKepalaKeluarga,
        blokRumah: parsed.blokRumah,
        noTelp: parsed.noTelp,
        statusHunian: parsed.statusHunian,
        jumlahAnggota: parsed.jumlahAnggota,
        tglBatasDomisili: parsed.tglBatasDomisili ?? null,
        tglPindah: parsed.tglPindah ?? null,
      })
      .returning();

    // Auto-create login account using direct Drizzle insert (bypasses disableSignUp)
    try {
      const pwHash = await hashPassword(parsed.noTelp);
      const uid = generateId();
      await tx.insert(user).values({
        id: uid,
        name: parsed.namaKepalaKeluarga,
        email: `${parsed.noTelp}@kas-rt.local`,
        emailVerified: true,
        username: parsed.noTelp,
        displayUsername: parsed.noTelp,
        role: parsed.isAdmin ? "admin" : "user",
        wargaId: newWarga.id,
      });
      await tx.insert(account).values({
        id: generateId(),
        userId: uid,
        accountId: uid,
        providerId: "credential",
        password: pwHash,
      });
    } catch (err) {
      // Roll back is automatic when error is thrown inside transaction
      throw new Error(`Gagal membuat akun login: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { ...newWarga, defaultPassword: parsed.noTelp };
  });

  await logActivity({
    userId: session.user.id,
    modul: "Data Warga",
    aksi: "tambah",
    keterangan: `Menambahkan warga baru an. ${parsed.namaKepalaKeluarga} (${parsed.blokRumah})`,
  });
  revalidatePath("/admin/warga");

  return result;
}

export async function updateWarga(id: number, data: WargaFormValues) {
  const session = await requireAdmin();
  const parsed = wargaFormSchema.parse(data);

  const [existing] = await db.select().from(warga).where(eq(warga.id, id));
  if (!existing) throw new Error("Warga tidak ditemukan");

  const updated = await db.transaction(async (tx) => {
    // If noTelp changed, update username on the linked user account
    if (existing.noTelp !== parsed.noTelp) {
      // Ensure new noTelp is not already taken by another user
      const [conflict] = await tx.select({ id: user.id }).from(user).where(eq(user.username, parsed.noTelp));
      if (conflict) {
        throw new Error(`Nomor telepon ${parsed.noTelp} sudah digunakan sebagai akun login`);
      }
      await tx
        .update(user)
        .set({
          username: parsed.noTelp,
          displayUsername: parsed.noTelp,
          email: `${parsed.noTelp}@kas-rt.local`,
          name: parsed.namaKepalaKeluarga,
          role: parsed.isAdmin ? "admin" : "user",
        })
        .where(eq(user.wargaId, id));
    } else {
      // Sync name and role change to linked user
      await tx
        .update(user)
        .set({
          name: parsed.namaKepalaKeluarga,
          role: parsed.isAdmin ? "admin" : "user",
        })
        .where(eq(user.wargaId, id));
    }

    const [updatedResult] = await tx
      .update(warga)
      .set({
        namaKepalaKeluarga: parsed.namaKepalaKeluarga,
        blokRumah: parsed.blokRumah,
        noTelp: parsed.noTelp,
        statusHunian: parsed.statusHunian,
        jumlahAnggota: parsed.jumlahAnggota,
        tglBatasDomisili: parsed.tglBatasDomisili ?? null,
        tglPindah: parsed.tglPindah ?? null,
      })
      .where(eq(warga.id, id))
      .returning();

    return updatedResult;
  });

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

  // Check related transactions
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transaksi)
    .where(eq(transaksi.wargaId, id));

  if (result && result.count > 0) {
    throw new Error(`Warga memiliki ${result.count} transaksi terkait, tidak bisa dihapus.`);
  }

  await db.transaction(async (tx) => {
    // Delete linked user account (sessions cascade via FK)
    await tx.delete(user).where(eq(user.wargaId, id));
    await tx.delete(warga).where(eq(warga.id, id));
  });

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
