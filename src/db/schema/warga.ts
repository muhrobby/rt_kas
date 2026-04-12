import { sql } from "drizzle-orm";
import { check, date, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const statusHunianEnum = pgEnum("status_hunian", ["tetap", "kontrak"]);

export const warga = pgTable(
  "warga",
  {
    id: serial("id").primaryKey(),
    namaKepalaKeluarga: text("nama_kepala_keluarga").notNull(),
    blokRumah: text("blok_rumah").notNull(),
    noTelp: text("no_telp").notNull().unique(),
    statusHunian: statusHunianEnum("status_hunian").notNull().default("tetap"),
    jumlahAnggota: integer("jumlah_anggota").notNull().default(1),
    tglBatasDomisili: date("tgl_batas_domisili"),
    tglPindah: date("tgl_pindah"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "warga_ck_status_domisili",
      sql`(
      (${table.statusHunian} = 'tetap' and ${table.tglBatasDomisili} is null)
      or
      (${table.statusHunian} = 'kontrak' and ${table.tglBatasDomisili} is not null)
    )`,
    ),
  ],
);

export type Warga = typeof warga.$inferSelect;
export type NewWarga = typeof warga.$inferInsert;
