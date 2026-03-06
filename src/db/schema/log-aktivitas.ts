import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const aksiEnum = pgEnum("aksi", ["tambah", "edit", "hapus", "login", "logout"]);

export const logAktivitas = pgTable("log_aktivitas", {
  id: serial("id").primaryKey(),
  waktuLog: timestamp("waktu_log").notNull().defaultNow(),
  userId: text("user_id").notNull(), // FK → Better Auth user.id
  modul: text("modul").notNull(),
  aksi: aksiEnum("aksi").notNull(),
  keterangan: text("keterangan").notNull(),
});

export type LogAktivitas = typeof logAktivitas.$inferSelect;
export type NewLogAktivitas = typeof logAktivitas.$inferInsert;
