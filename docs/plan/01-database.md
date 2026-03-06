# 01 - Database Design

## ORM: Drizzle ORM + PostgreSQL

Drizzle is chosen over Prisma for its lighter footprint, SQL-like query API, and native Better Auth adapter support. Schema is defined in TypeScript with full type inference.

---

## File Structure

```
src/
├── db/
│   ├── index.ts              # Drizzle client instance
│   ├── schema/
│   │   ├── index.ts          # Barrel export (re-exports all schemas)
│   │   ├── auth.ts           # Better Auth tables (user, session, account, verification)
│   │   ├── warga.ts          # tb_warga
│   │   ├── kategori-kas.ts   # tb_kategori_kas
│   │   ├── transaksi.ts      # tb_transaksi
│   │   ├── log-aktivitas.ts  # tb_log_aktivitas
│   │   └── relations.ts      # All Drizzle relations
│   └── seed.ts               # Seed script for initial data
├── drizzle/                   # Auto-generated migration files (by drizzle-kit)
drizzle.config.ts              # Drizzle Kit config (project root)
```

---

## Drizzle Config

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## DB Client

```ts
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

---

## Schema Definitions

### Table 1: auth.ts (Better Auth managed)

Better Auth auto-generates these tables via CLI (`npx @better-auth/cli generate`). They will be placed here for reference and Drizzle awareness. Key tables:

- **user** - id, name, email, emailVerified, image, role, banned, banReason, banExpires, createdAt, updatedAt
- **session** - id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt
- **account** - id, userId, accountId, providerId, accessToken, refreshToken, etc.
- **verification** - id, identifier, value, expiresAt, createdAt, updatedAt

Better Auth's admin plugin adds `role`, `banned`, `banReason`, `banExpires` to the `user` table.

We will add a custom field `wargaId` to link users to their warga profile.

```ts
// src/db/schema/auth.ts
// This file is generated/updated by: npx @better-auth/cli generate --output src/db/schema/auth.ts
// After generation, add the custom wargaId field manually or via Better Auth's user.additionalFields config.
```

---

### Table 2: warga.ts

Maps to requirement: `tb_warga`

```ts
// src/db/schema/warga.ts
import { pgEnum, pgTable, serial, text, date, timestamp } from "drizzle-orm/pg-core";

export const statusHunianEnum = pgEnum("status_hunian", ["tetap", "kontrak"]);

export const warga = pgTable("warga", {
  id: serial("id").primaryKey(),
  namaKepalaKeluarga: text("nama_kepala_keluarga").notNull(),
  blokRumah: text("blok_rumah").notNull(),
  noTelp: text("no_telp").notNull(),
  statusHunian: statusHunianEnum("status_hunian").notNull().default("tetap"),
  tglBatasDomisili: date("tgl_batas_domisili"),  // NULL if warga tetap
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Warga = typeof warga.$inferSelect;
export type NewWarga = typeof warga.$inferInsert;
```

**Columns:**

| Column               | Type                         | Nullable | Notes                            |
| -------------------- | ---------------------------- | -------- | -------------------------------- |
| id                   | serial PK                    | No       | Auto-increment                   |
| nama_kepala_keluarga | text                         | No       | Nama KK                          |
| blok_rumah           | text                         | No       | e.g. "Blok A1 No. 5"            |
| no_telp              | text                         | No       | Phone number                     |
| status_hunian        | enum(tetap, kontrak)         | No       | Default: tetap                   |
| tgl_batas_domisili   | date                         | Yes      | NULL if warga tetap              |
| created_at           | timestamp                    | No       | Auto                             |
| updated_at           | timestamp                    | No       | Auto-update                      |

---

### Table 3: kategori-kas.ts

Maps to requirement: `tb_kategori_kas`

```ts
// src/db/schema/kategori-kas.ts
import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const jenisArusEnum = pgEnum("jenis_arus", ["masuk", "keluar"]);

export const kategoriKas = pgTable("kategori_kas", {
  id: serial("id").primaryKey(),
  namaKategori: text("nama_kategori").notNull(),
  jenisArus: jenisArusEnum("jenis_arus").notNull(),
  nominalDefault: integer("nominal_default").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type KategoriKas = typeof kategoriKas.$inferSelect;
export type NewKategoriKas = typeof kategoriKas.$inferInsert;
```

**Columns:**

| Column          | Type                    | Nullable | Notes                                  |
| --------------- | ----------------------- | -------- | -------------------------------------- |
| id              | serial PK               | No       | Auto-increment                         |
| nama_kategori   | text                    | No       | e.g. "Keamanan", "Sampah", "Operasional" |
| jenis_arus      | enum(masuk, keluar)     | No       | Income or expense category             |
| nominal_default | integer                 | No       | Default amount (e.g. 25000). 0 if none |
| created_at      | timestamp               | No       | Auto                                   |

---

### Table 4: transaksi.ts

Maps to requirement: `tb_transaksi` - The core financial table.

```ts
// src/db/schema/transaksi.ts
import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { kategoriKas } from "./kategori-kas";
import { warga } from "./warga";

export const tipeArusEnum = pgEnum("tipe_arus", ["masuk", "keluar"]);

export const transaksi = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  waktuTransaksi: timestamp("waktu_transaksi").notNull().defaultNow(),
  userId: text("user_id").notNull(),                                    // FK → Better Auth user.id (the admin who recorded it)
  wargaId: integer("warga_id").references(() => warga.id, {
    onDelete: "set null",
  }),                                                                    // FK → warga.id (NULL for pengeluaran)
  kategoriId: integer("kategori_id").notNull().references(() => kategoriKas.id, {
    onDelete: "restrict",
  }),
  bulanTagihan: varchar("bulan_tagihan", { length: 20 }),               // e.g. "Januari", NULL for pengeluaran
  tahunTagihan: integer("tahun_tagihan"),                               // e.g. 2026, NULL for pengeluaran
  nominal: integer("nominal").notNull(),
  tipeArus: tipeArusEnum("tipe_arus").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Transaksi = typeof transaksi.$inferSelect;
export type NewTransaksi = typeof transaksi.$inferInsert;
```

**Columns:**

| Column           | Type                    | Nullable | Notes                                     |
| ---------------- | ----------------------- | -------- | ----------------------------------------- |
| id               | serial PK               | No       | Auto-increment                            |
| waktu_transaksi  | timestamp               | No       | When the transaction was recorded         |
| user_id          | text FK→user            | No       | Admin who recorded (audit trail)          |
| warga_id         | integer FK→warga        | Yes      | NULL for pengeluaran                      |
| kategori_id      | integer FK→kategori_kas | No       | Category reference                        |
| bulan_tagihan    | varchar(20)             | Yes      | e.g. "Januari" - NULL for pengeluaran    |
| tahun_tagihan    | integer                 | Yes      | e.g. 2026 - NULL for pengeluaran         |
| nominal          | integer                 | No       | Amount in Rupiah                          |
| tipe_arus        | enum(masuk, keluar)     | No       | Income or expense                         |
| keterangan       | text                    | Yes      | Optional description                      |
| created_at       | timestamp               | No       | Auto                                      |

---

### Table 5: log-aktivitas.ts

Maps to requirement: `tb_log_aktivitas` - Enterprise audit trail.

```ts
// src/db/schema/log-aktivitas.ts
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const aksiEnum = pgEnum("aksi", ["tambah", "edit", "hapus", "login", "logout"]);

export const logAktivitas = pgTable("log_aktivitas", {
  id: serial("id").primaryKey(),
  waktuLog: timestamp("waktu_log").notNull().defaultNow(),
  userId: text("user_id").notNull(),                       // FK → Better Auth user.id
  modul: text("modul").notNull(),                          // e.g. "Data Warga", "Transaksi", "Kategori"
  aksi: aksiEnum("aksi").notNull(),
  keterangan: text("keterangan").notNull(),                // e.g. "Menambahkan warga baru an. Bpk Ahmad"
});

export type LogAktivitas = typeof logAktivitas.$inferSelect;
export type NewLogAktivitas = typeof logAktivitas.$inferInsert;
```

**Columns:**

| Column     | Type                                     | Nullable | Notes                                     |
| ---------- | ---------------------------------------- | -------- | ----------------------------------------- |
| id         | serial PK                                | No       | Auto-increment                            |
| waktu_log  | timestamp                                | No       | Precise to seconds                        |
| user_id    | text FK→user                             | No       | Who did it                                |
| modul      | text                                     | No       | Which module                              |
| aksi       | enum(tambah, edit, hapus, login, logout) | No       | What action                               |
| keterangan | text                                     | No       | Human-readable description                |

---

## Relations

```ts
// src/db/schema/relations.ts
import { relations } from "drizzle-orm";

import { kategoriKas } from "./kategori-kas";
import { logAktivitas } from "./log-aktivitas";
import { transaksi } from "./transaksi";
import { warga } from "./warga";

// Warga has many transaksi
export const wargaRelations = relations(warga, ({ many }) => ({
  transaksi: many(transaksi),
}));

// KategoriKas has many transaksi
export const kategoriKasRelations = relations(kategoriKas, ({ many }) => ({
  transaksi: many(transaksi),
}));

// Transaksi belongs to warga (optional) and kategoriKas
export const transaksiRelations = relations(transaksi, ({ one }) => ({
  warga: one(warga, {
    fields: [transaksi.wargaId],
    references: [warga.id],
  }),
  kategori: one(kategoriKas, {
    fields: [transaksi.kategoriId],
    references: [kategoriKas.id],
  }),
}));

// Note: Relations to Better Auth's user table are handled via userId (text) fields.
// These are queried via joins rather than Drizzle relations to avoid tight coupling
// with auto-generated auth schema.
```

---

## ERD Summary

```
┌──────────────┐     1:1      ┌──────────────┐
│    warga     │──────────────│     user     │  (via user.wargaId → warga.id)
│              │              │ (Better Auth)│
└──────┬───────┘              └──────┬───────┘
       │ 1:M                         │ 1:M
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│  transaksi   │              │log_aktivitas │
└──────┬───────┘              └──────────────┘
       │ M:1
       │
       ▼
┌──────────────┐
│ kategori_kas │
└──────────────┘
```

---

## Seed Data

The seed script (`src/db/seed.ts`) will create:

1. **Default admin user** via Better Auth API:
   - Phone: `08123456789`, Password: `admin123`, Role: `admin`

2. **Sample kategori_kas**:
   - Keamanan (masuk, Rp 25.000)
   - Sampah (masuk, Rp 15.000)
   - Donasi 17 Agustus (masuk, Rp 0)
   - Operasional RT (keluar, Rp 0)
   - Sosial (keluar, Rp 0)

3. **Sample warga** (5-10 entries):
   - Various blok/no rumah, status tetap/kontrak

4. **Sample transaksi** (10-20 entries):
   - Mix of pemasukan and pengeluaran across several months

---

## Migration Workflow

```bash
# During development: push schema directly
npm run db:push

# For production: generate + apply migrations
npm run db:generate    # Creates SQL in ./drizzle/
npm run db:migrate     # Applies pending migrations

# Seed initial data
npm run db:seed

# Browse data visually
npm run db:studio
```
