# 06 - Shared Services

## Overview

Cross-cutting services used by multiple modules: audit trail logging, PDF generation, Excel export, and shared utility functions.

---

## File Structure

```
src/
├── server/
│   └── actions/
│       ├── audit.ts               # Audit trail helper
│       ├── warga.ts               # Warga CRUD actions
│       ├── kategori-kas.ts        # Kategori CRUD actions
│       ├── kas-masuk.ts           # Payment actions
│       ├── kas-keluar.ts          # Expense actions
│       ├── laporan.ts             # Report query actions
│       ├── log-aktivitas.ts       # Log query/filter actions
│       ├── warga-dashboard.ts     # Warga dashboard queries
│       ├── warga-riwayat.ts       # Warga payment history queries
│       └── transparansi.ts        # Kas transparency queries
├── lib/
│   ├── auth.ts                    # Better Auth server
│   ├── auth-client.ts             # Better Auth client
│   ├── auth-helpers.ts            # Session helpers (requireAdmin, requireAuth)
│   ├── utils.ts                   # Existing + new utility functions
│   ├── pdf/
│   │   └── laporan-template.tsx   # React-PDF template for financial report
│   └── excel/
│       └── export-helpers.ts      # ExcelJS export utilities
├── app/
│   └── api/
│       ├── auth/[...all]/route.ts # Better Auth handler
│       └── laporan/
│           ├── pdf/route.ts       # PDF generation endpoint
│           └── excel/route.ts     # Excel generation endpoint
```

---

## 1. Audit Trail Service

Every data mutation in the system is logged. The audit service is the core of the traceability requirement.

### Implementation

```ts
// src/server/actions/audit.ts
"use server";

import { db } from "@/db";
import { logAktivitas } from "@/db/schema";

export type AuditModul =
  | "Data Warga"
  | "Kategori Kas"
  | "Kas Masuk"
  | "Kas Keluar"
  | "Laporan"
  | "Login"
  | "Logout";

export type AuditAksi = "tambah" | "edit" | "hapus" | "login" | "logout";

interface LogActivityParams {
  userId: string;
  modul: AuditModul;
  aksi: AuditAksi;
  keterangan: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  await db.insert(logAktivitas).values({
    userId: params.userId,
    modul: params.modul,
    aksi: params.aksi,
    keterangan: params.keterangan,
  });
}
```

### Usage Pattern

Every server action that mutates data follows this pattern:

```ts
// Example: createWarga in src/server/actions/warga.ts
"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { logActivity } from "./audit";

export async function createWarga(data: NewWarga) {
  const session = await requireAdmin();

  const [newWarga] = await db.insert(warga).values(data).returning();

  await logActivity({
    userId: session.user.id,
    modul: "Data Warga",
    aksi: "tambah",
    keterangan: `Menambahkan warga baru an. ${data.namaKepalaKeluarga} (${data.blokRumah})`,
  });

  return newWarga;
}
```

### Audit Messages Template

| Module      | Action | Message Template                                                    |
| ----------- | ------ | ------------------------------------------------------------------- |
| Data Warga  | Tambah | "Menambahkan warga baru an. {nama} ({blok})"                       |
| Data Warga  | Edit   | "Mengubah data warga an. {nama}: {field yang berubah}"              |
| Data Warga  | Hapus  | "Menghapus data warga an. {nama} ({blok})"                         |
| Kategori    | Tambah | "Menambahkan kategori kas baru: {nama} ({jenis})"                  |
| Kas Masuk   | Tambah | "Mencatat iuran {kategori} Rp {nominal} untuk {nama} ({blok})"    |
| Kas Keluar  | Tambah | "Mencatat pengeluaran {kategori} Rp {nominal}: {keterangan}"      |
| Login       | Login  | "Login berhasil"                                                    |
| Logout      | Logout | "Logout"                                                            |

---

## 2. PDF Generation Service

Server-side PDF generation using `@react-pdf/renderer` for financial reports.

### API Route

```ts
// src/app/api/laporan/pdf/route.ts
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { requireAdmin } from "@/lib/auth-helpers";
import { LaporanPDF } from "@/lib/pdf/laporan-template";
import { getRekapKas } from "@/server/actions/laporan";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const bulanAwal = Number(searchParams.get("bulanAwal"));
  const bulanAkhir = Number(searchParams.get("bulanAkhir"));
  const tahun = Number(searchParams.get("tahun"));

  const data = await getRekapKas(bulanAwal, bulanAkhir, tahun);

  const pdfBuffer = await renderToBuffer(
    <LaporanPDF data={data} bulanAwal={bulanAwal} bulanAkhir={bulanAkhir} tahun={tahun} />
  );

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Laporan-Kas-RT-${bulanAwal}-${bulanAkhir}-${tahun}.pdf"`,
    },
  });
}
```

### PDF Template

```tsx
// src/lib/pdf/laporan-template.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 11, textAlign: "center", marginBottom: 20 },
  table: { display: "flex", flexDirection: "column", borderWidth: 1, borderColor: "#000" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  headerRow: { flexDirection: "row", backgroundColor: "#f0f0f0", borderBottomWidth: 1 },
  cell: { padding: 4, flex: 1 },
  footer: { marginTop: 20, fontSize: 8, textAlign: "center", color: "#666" },
});

interface LaporanPDFProps {
  data: TransaksiRekapItem[];
  bulanAwal: number;
  bulanAkhir: number;
  tahun: number;
}

export function LaporanPDF({ data, bulanAwal, bulanAkhir, tahun }: LaporanPDFProps) {
  const totalMasuk = data.reduce((sum, d) => sum + (d.tipeArus === "masuk" ? d.nominal : 0), 0);
  const totalKeluar = data.reduce((sum, d) => sum + (d.tipeArus === "keluar" ? d.nominal : 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>LAPORAN KEUANGAN KAS RT</Text>
        <Text style={styles.subtitle}>
          Periode: Bulan {bulanAwal} - {bulanAkhir} Tahun {tahun}
        </Text>

        {/* Table header */}
        <View style={styles.headerRow}>
          <Text style={[styles.cell, { flex: 0.5 }]}>No</Text>
          <Text style={styles.cell}>Tanggal</Text>
          <Text style={[styles.cell, { flex: 2 }]}>Uraian</Text>
          <Text style={styles.cell}>Pemasukan</Text>
          <Text style={styles.cell}>Pengeluaran</Text>
          <Text style={styles.cell}>Petugas</Text>
        </View>

        {/* Table rows */}
        {data.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
            <Text style={styles.cell}>{formatDate(item.waktuTransaksi)}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.keterangan}</Text>
            <Text style={styles.cell}>
              {item.tipeArus === "masuk" ? formatRupiah(item.nominal) : "-"}
            </Text>
            <Text style={styles.cell}>
              {item.tipeArus === "keluar" ? formatRupiah(item.nominal) : "-"}
            </Text>
            <Text style={styles.cell}>{item.userName}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={{ marginTop: 10, borderTopWidth: 2 }}>
          <Text>Total Pemasukan: {formatRupiah(totalMasuk)}</Text>
          <Text>Total Pengeluaran: {formatRupiah(totalKeluar)}</Text>
          <Text style={{ fontWeight: "bold" }}>Saldo: {formatRupiah(totalMasuk - totalKeluar)}</Text>
        </View>

        <Text style={styles.footer}>
          Dicetak pada: {new Date().toLocaleString("id-ID")} | Sistem Kas RT
        </Text>
      </Page>
    </Document>
  );
}
```

### Client-Side Download Trigger

```tsx
// In report-filters.tsx
const handleDownloadPDF = () => {
  const url = `/api/laporan/pdf?bulanAwal=${bulanAwal}&bulanAkhir=${bulanAkhir}&tahun=${tahun}`;
  window.open(url, "_blank");
};
```

---

## 3. Excel Export Service

Using `exceljs` for generating `.xlsx` files.

### Utility Functions

```ts
// src/lib/excel/export-helpers.ts
import ExcelJS from "exceljs";

interface ExcelColumn {
  header: string;
  key: string;
  width: number;
}

interface ExportToExcelOptions<T> {
  data: T[];
  columns: ExcelColumn[];
  sheetName: string;
  fileName: string;
}

export async function generateExcelBuffer<T extends Record<string, unknown>>(
  options: ExportToExcelOptions<T>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(options.sheetName);

  sheet.columns = options.columns;

  // Header styling
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  for (const item of options.data) {
    sheet.addRow(item);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
```

### API Route (Laporan Excel)

```ts
// src/app/api/laporan/excel/route.ts
import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth-helpers";
import { generateExcelBuffer } from "@/lib/excel/export-helpers";
import { getRekapKas } from "@/server/actions/laporan";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  // ... parse params

  const data = await getRekapKas(bulanAwal, bulanAkhir, tahun);

  const buffer = await generateExcelBuffer({
    data: data.map((d, i) => ({
      no: i + 1,
      tanggal: formatDate(d.waktuTransaksi),
      uraian: d.keterangan,
      pemasukan: d.tipeArus === "masuk" ? d.nominal : 0,
      pengeluaran: d.tipeArus === "keluar" ? d.nominal : 0,
      petugas: d.userName,
    })),
    columns: [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Uraian", key: "uraian", width: 40 },
      { header: "Pemasukan (Rp)", key: "pemasukan", width: 18 },
      { header: "Pengeluaran (Rp)", key: "pengeluaran", width: 18 },
      { header: "Petugas", key: "petugas", width: 15 },
    ],
    sheetName: "Laporan Kas RT",
    fileName: `Laporan-${tahun}`,
  });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Laporan-Kas-RT-${bulanAwal}-${bulanAkhir}-${tahun}.xlsx"`,
    },
  });
}
```

---

## 4. Shared Utility Functions

### Additions to `src/lib/utils.ts`

```ts
// Currency formatting
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Date formatting
export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Date+time formatting (for audit trail)
export function formatWaktu(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

// Month names in Indonesian
export const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

// WhatsApp link generator
export function getWhatsAppLink(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const international = cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${international}`;
}

// Generate transaction reference number
export function generateRefNumber(prefix: string = "TRX"): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${dateStr}-${random}`;
}
```

---

## 5. Auth Helpers

```ts
// src/lib/auth-helpers.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type Session } from "@/lib/auth";

export async function getServerSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireWarga(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "user" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  return session;
}
```

---

## 6. Server Action Patterns

### Standard CRUD Pattern

Every server action file follows this consistent structure:

```ts
// src/server/actions/{module}.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth-helpers";
import { logActivity } from "./audit";

// 1. List (paginated, filtered)
export async function getList(filters?: Filters) {
  await requireAdmin();
  // Query with optional filters, pagination
  return db.select().from(table).where(...).limit(...).offset(...);
}

// 2. Get by ID (for edit forms)
export async function getById(id: number) {
  await requireAdmin();
  return db.select().from(table).where(eq(table.id, id)).limit(1);
}

// 3. Create
export async function create(data: NewType) {
  const session = await requireAdmin();
  const [result] = await db.insert(table).values(data).returning();
  await logActivity({ userId: session.user.id, modul: "...", aksi: "tambah", keterangan: "..." });
  revalidatePath("/admin/...");
  return result;
}

// 4. Update
export async function update(id: number, data: Partial<NewType>) {
  const session = await requireAdmin();
  const [result] = await db.update(table).set(data).where(eq(table.id, id)).returning();
  await logActivity({ userId: session.user.id, modul: "...", aksi: "edit", keterangan: "..." });
  revalidatePath("/admin/...");
  return result;
}

// 5. Delete
export async function remove(id: number) {
  const session = await requireAdmin();
  await db.delete(table).where(eq(table.id, id));
  await logActivity({ userId: session.user.id, modul: "...", aksi: "hapus", keterangan: "..." });
  revalidatePath("/admin/...");
}
```

### Validation Pattern

All form data is validated on both client and server:

```ts
// Client: React Hook Form + Zod schema (in _components/ form files)
// Server: Re-validate with same Zod schema in server action

import { z } from "zod";

const schema = z.object({ ... });

export async function create(rawData: unknown) {
  const session = await requireAdmin();
  const data = schema.parse(rawData);  // Throws if invalid
  // ... proceed with insert
}
```

---

## 7. Zod Schemas (Shared Validation)

```
src/lib/validations/
├── warga.ts          # Warga form schema
├── kategori-kas.ts   # Kategori form schema
├── kas-masuk.ts      # Payment form schema
├── kas-keluar.ts     # Expense form schema
└── index.ts          # Barrel export
```

These schemas are imported by both the client-side form components (for React Hook Form validation) and the server actions (for server-side re-validation).

```ts
// src/lib/validations/warga.ts
import { z } from "zod";

export const wargaFormSchema = z.object({
  namaKepalaKeluarga: z.string().min(1, "Nama wajib diisi"),
  blokRumah: z.string().min(1, "Blok rumah wajib diisi"),
  noTelp: z.string().min(10, "Nomor telepon minimal 10 digit").max(15),
  statusHunian: z.enum(["tetap", "kontrak"]),
  tglBatasDomisili: z.string().nullable().optional(),
});

export type WargaFormValues = z.infer<typeof wargaFormSchema>;
```
