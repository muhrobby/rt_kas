"use server";

import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { logAktivitas, user } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";

export interface LogFilters {
  tanggalMulai?: string;
  tanggalAkhir?: string;
  modul?: string;
  aksi?: string;
  userId?: string;
}

export async function getLogList(filters?: LogFilters) {
  await requireAdmin();

  const conditions = [];

  if (filters?.tanggalMulai) {
    conditions.push(gte(logAktivitas.waktuLog, new Date(filters.tanggalMulai)));
  }
  if (filters?.tanggalAkhir) {
    const end = new Date(filters.tanggalAkhir);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(logAktivitas.waktuLog, end));
  }
  if (filters?.modul && filters.modul !== "semua") {
    conditions.push(eq(logAktivitas.modul, filters.modul));
  }
  if (filters?.aksi && filters.aksi !== "semua") {
    conditions.push(eq(logAktivitas.aksi, filters.aksi as "tambah" | "edit" | "hapus" | "login" | "logout"));
  }
  if (filters?.userId && filters.userId !== "semua") {
    conditions.push(eq(logAktivitas.userId, filters.userId));
  }

  return db
    .select()
    .from(logAktivitas)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(logAktivitas.waktuLog))
    .limit(200);
}

export async function getRecentActivity(limit = 5) {
  await requireAdmin();
  return db.select().from(logAktivitas).orderBy(desc(logAktivitas.waktuLog)).limit(limit);
}

export async function getAdminList() {
  await requireAdmin();
  return db.select({ id: user.id, name: user.name }).from(user).where(eq(user.role, "admin")).orderBy(user.name);
}
