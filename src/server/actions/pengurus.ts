"use server";

import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { and, desc, eq, ilike, not, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { account, user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-helpers";
import { logActivity } from "@/server/actions/audit";

const pengurusSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().min(5, "Username minimal 5 karakter").max(20, "Username maksimal 20 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter").optional().or(z.literal("")),
});

export type PengurusFormData = z.infer<typeof pengurusSchema>;

export async function getPengurusList(searchQuery?: string) {
  await requireAdmin();

  let conditions = eq(user.role, "admin");
  if (searchQuery) {
    const escapedSearch = searchQuery.replace(/[%_\\]/g, "\\$&");
    conditions = and(
      conditions,
      or(
        ilike(user.name, `%${escapedSearch}%`),
        ilike(user.email, `%${escapedSearch}%`),
        ilike(user.username, `%${escapedSearch}%`),
      ),
    )!;
  }

  const allAdmins = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(conditions)
    .orderBy(desc(user.createdAt));

  return allAdmins;
}

export async function createPengurus(data: PengurusFormData) {
  const session = await requireAdmin();
  const input = pengurusSchema.parse(data);

  if (!input.password) {
    throw new Error("Password wajib diisi untuk pengurus baru");
  }

  // Check email and username duplicates
  const existingUser = await db.query.user.findFirst({
    where: or(eq(user.email, input.email), eq(user.username, input.username)),
  });

  if (existingUser) {
    throw new Error("Email atau Username sudah digunakan");
  }

  const adminId = generateId();
  const passwordHash = await hashPassword(input.password);

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: adminId,
      name: input.name,
      email: input.email,
      emailVerified: true,
      username: input.username,
      displayUsername: input.username,
      role: "admin",
    });

    await tx.insert(account).values({
      id: generateId(),
      userId: adminId,
      accountId: adminId,
      providerId: "credential",
      password: passwordHash,
    });
  });

  await logActivity({
    userId: session.user.id,
    modul: "Pengurus",
    aksi: "tambah",
    keterangan: `Menambah pengurus baru: ${input.name}`,
  });
}

export async function updatePengurus(id: string, data: PengurusFormData) {
  const session = await requireAdmin();
  const input = pengurusSchema.parse(data);

  // Prevent duplicate email/username on other accounts
  const existingUser = await db.query.user.findFirst({
    where: and(not(eq(user.id, id)), or(eq(user.email, input.email), eq(user.username, input.username))),
  });

  if (existingUser) {
    throw new Error("Email atau Username sudah digunakan oleh akun lain");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({
        name: input.name,
        email: input.email,
        username: input.username,
        displayUsername: input.username,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    if (input.password && input.password.trim() !== "") {
      const passwordHash = await hashPassword(input.password);
      await tx
        .update(account)
        .set({
          password: passwordHash,
          updatedAt: new Date(),
        })
        .where(and(eq(account.userId, id), eq(account.providerId, "credential")));
    }
  });

  await logActivity({
    userId: session.user.id,
    modul: "Pengurus",
    aksi: "edit",
    keterangan: `Mengubah data pengurus: ${input.name}`,
  });
}

export async function deletePengurus(id: string) {
  const session = await requireAdmin();

  if (id === session.user.id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri");
  }

  const targetUser = await db.query.user.findFirst({
    where: and(eq(user.id, id), eq(user.role, "admin")),
  });

  if (!targetUser) throw new Error("Pengurus tidak ditemukan");

  // Periksa sisa admin: pastikan ada minimal 1 admin setelah dihapus
  const adminCountResult = await db.select().from(user).where(eq(user.role, "admin"));
  if (adminCountResult.length <= 1) {
    throw new Error("Gagal: Sistem harus memiliki setidaknya satu administrator");
  }

  await db.delete(user).where(eq(user.id, id));

  await logActivity({
    userId: session.user.id,
    modul: "Pengurus",
    aksi: "hapus",
    keterangan: `Menghapus pengurus: ${targetUser.name}`,
  });
}
