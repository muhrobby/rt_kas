import { date, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const statusHunianEnum = pgEnum("status_hunian", ["tetap", "kontrak"]);

export const warga = pgTable("warga", {
  id: serial("id").primaryKey(),
  namaKepalaKeluarga: text("nama_kepala_keluarga").notNull(),
  blokRumah: text("blok_rumah").notNull(),
  noTelp: text("no_telp").notNull(),
  statusHunian: statusHunianEnum("status_hunian").notNull().default("tetap"),
  tglBatasDomisili: date("tgl_batas_domisili"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Warga = typeof warga.$inferSelect;
export type NewWarga = typeof warga.$inferInsert;
