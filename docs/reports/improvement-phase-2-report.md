# Improvement Phase 2 Report — High Security Hardening

**Tanggal:** 6 Maret 2026  
**Fase:** 2 dari 4  
**Kategori:** High Security + Medium (Zod, middleware)  
**TypeScript:** PASS (0 errors)  
**Lint:** 11 warnings (pre-existing, tidak ada regresi)

---

## Perubahan yang Dilakukan

### 2.1 Password Policy (H-1) ✅

**Masalah:** Tidak ada batas panjang password minimum/maksimum.

**Solusi:** Tambahkan `minPasswordLength: 8` dan `maxPasswordLength: 128` ke konfigurasi `emailAndPassword` di Better Auth.

**File diubah:**
- `src/lib/auth.ts`

---

### 2.2 Rate Limiting (H-2) ✅

**Masalah:** Tidak ada rate limiting pada auth endpoints — rentan terhadap brute force login.

**Solusi:** Tambahkan konfigurasi `rateLimit` di Better Auth:
```ts
rateLimit: {
  window: 60,  // 60 detik
  max: 10,     // max 10 request per window
}
```

**File diubah:**
- `src/lib/auth.ts`

---

### 2.3 Cookie Cache Tuning (M-3) ✅

**Masalah:** Cookie cache `maxAge: 60 * 5` (5 menit) menyebabkan session yang di-revoke masih aktif sampai 5 menit.

**Solusi:** Turunkan ke `60 * 2` (2 menit) — keseimbangan antara performance dan responsiveness revocation.

**File diubah:**
- `src/lib/auth.ts`

---

### 2.4 Server-Side Zod Re-validation (M-1) ✅

**Masalah:** 4 server actions mutation menerima data dari client tanpa validasi ulang di server-side. Jika client-side validation di-bypass, data invalid bisa masuk ke database.

**Solusi:** Tambahkan `.parse()` dari schema Zod yang sudah ada di awal setiap mutation function, sebelum DB operation. Import schema (bukan hanya type) di setiap file.

**File diubah:**

| File | Fungsi | Schema |
|------|--------|--------|
| `src/server/actions/warga.ts` | `createWarga`, `updateWarga` | `wargaFormSchema` |
| `src/server/actions/kategori-kas.ts` | `createKategori`, `updateKategori` | `kategoriFormSchema` |
| `src/server/actions/kas-masuk.ts` | `createPembayaran` | `kasMasukFormSchema` |
| `src/server/actions/kas-keluar.ts` | `createPengeluaran` | `kasKeluarFormSchema` |

**Pattern yang digunakan:**
```ts
export async function createWarga(data: WargaFormValues) {
  const session = await requireAdmin();
  const parsed = wargaFormSchema.parse(data); // throws ZodError jika invalid
  // ... gunakan parsed, bukan data
}
```

---

### 2.5 Middleware — Pertimbangan (H-6)

Middleware saat ini hanya mengecek keberadaan session cookie (`getSessionCookie(request)`), tidak memvalidasi isinya.

**Keputusan:** Defense-in-depth sudah cukup — setiap server action dan page sudah di-guard individual dengan `requireAdmin()` / `requireWarga()` yang memvalidasi session penuh via Better Auth API. Menambahkan full session validation di middleware akan menambah latency setiap request.

Middleware tetap berfungsi sebagai **first-line redirect** untuk UX (hindari flash 401), sedangkan server-side auth guards adalah **enforcement layer** yang sesungguhnya.

---

## Ringkasan

| Item | Status | File |
|------|--------|------|
| Password min/max length | ✅ Done | `auth.ts` |
| Rate limiting (10 req/60s) | ✅ Done | `auth.ts` |
| Cookie cache turun ke 2 menit | ✅ Done | `auth.ts` |
| Zod server-side — `createWarga` | ✅ Done | `warga.ts` |
| Zod server-side — `updateWarga` | ✅ Done | `warga.ts` |
| Zod server-side — `createKategori` | ✅ Done | `kategori-kas.ts` |
| Zod server-side — `updateKategori` | ✅ Done | `kategori-kas.ts` |
| Zod server-side — `createPembayaran` | ✅ Done | `kas-masuk.ts` |
| Zod server-side — `createPengeluaran` | ✅ Done | `kas-keluar.ts` |
| Middleware full validation | ⏭️ Skipped (defense-in-depth sudah ada) | — |

**TypeScript:** PASS (0 errors)  
**Lint:** 11 warnings (pre-existing, tidak ada regresi)
