import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const jenisArusEnum = pgEnum("jenis_arus", ["masuk", "keluar"]);
export const tipeTagihanEnum = pgEnum("tipe_tagihan", ["bulanan", "sekali"]);

export const kategoriKas = pgTable("kategori_kas", {
  id: serial("id").primaryKey(),
  namaKategori: text("nama_kategori").notNull(),
  jenisArus: jenisArusEnum("jenis_arus").notNull(),
  tipeTagihan: tipeTagihanEnum("tipe_tagihan").notNull().default("bulanan"),
  nominalDefault: integer("nominal_default").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type KategoriKas = typeof kategoriKas.$inferSelect;
export type NewKategoriKas = typeof kategoriKas.$inferInsert;
