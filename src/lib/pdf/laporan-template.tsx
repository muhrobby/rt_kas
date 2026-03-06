import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { RekapItem } from "@/server/actions/laporan";

// ── Color palette (sama dengan kuitansi-template) ─────────────────────────────

const C = {
  primary: "#1a56db",
  primaryLight: "#e8f0fe",
  textDark: "#111827",
  textMid: "#374151",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  borderDark: "#d1d5db",
  green: "#059669",
  greenBg: "#d1fae5",
  red: "#dc2626",
  bg: "#ffffff",
  rowAlt: "#f9fafb",
} as const;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.textDark,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orgBlock: { flexDirection: "column" },
  orgName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    letterSpacing: 0.5,
  },
  orgSub: { fontSize: 8, color: C.textMuted, marginTop: 2 },

  reportBlock: { alignItems: "flex-end" },
  reportLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.textDark,
    letterSpacing: 0.5,
  },
  periodLabel: {
    fontSize: 8,
    color: C.textMuted,
    marginTop: 3,
  },
  printedAt: {
    fontSize: 7,
    color: C.textMuted,
    marginTop: 2,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 1,
    borderColor: C.borderDark,
    marginBottom: 16,
  },
  dividerThin: {
    borderBottomWidth: 0.5,
    borderColor: C.border,
    marginBottom: 8,
  },

  // ── Summary strip (3 stat cards) ───────────────────────────────────────────
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  statCardBlue: { backgroundColor: C.primaryLight, borderColor: C.primary },
  statCardGreen: { backgroundColor: C.greenBg, borderColor: "#6ee7b7" },
  statCardRed: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  statTitle: { fontSize: 7, color: C.textMuted, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  statValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.textDark },
  statValueGreen: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.green },
  statValueRed: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.red },

  // ── Table ──────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    minHeight: 18,
  },
  tableRowAlt: { backgroundColor: C.rowAlt },

  colNo: { width: 20, fontSize: 8 },
  colDate: { width: 54, fontSize: 8 },
  colUraian: { flex: 1, fontSize: 8 },
  colKategori: { width: 80, fontSize: 8 },
  colMasuk: { width: 72, textAlign: "right", fontSize: 8 },
  colKeluar: { width: 72, textAlign: "right", fontSize: 8 },
  colSaldo: { width: 80, textAlign: "right", fontSize: 8 },

  cellMuted: { fontSize: 7, color: C.textMuted },
  cellGreen: { color: C.green },
  cellRed: { color: C.red },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderColor: C.border,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: C.textMuted },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function fmtDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtDateTime(date: Date): string {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface LaporanPDFProps {
  data: RekapItem[];
  bulanAwal: number;
  bulanAkhir: number;
  tahun: number;
  rtName?: string;
  rtAddress?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LaporanPDF({
  data,
  bulanAwal,
  bulanAkhir,
  tahun,
  rtName = "Kas RT",
  rtAddress = "Sistem Manajemen Keuangan Rukun Tetangga",
}: LaporanPDFProps) {
  const totalMasuk = data.reduce((sum, d) => sum + (d.tipeArus === "masuk" ? d.nominal : 0), 0);
  const totalKeluar = data.reduce((sum, d) => sum + (d.tipeArus === "keluar" ? d.nominal : 0), 0);
  const saldo = totalMasuk - totalKeluar;

  const periodLabel =
    bulanAwal === bulanAkhir
      ? `${BULAN_NAMES[bulanAwal - 1]} ${tahun}`
      : `${BULAN_NAMES[bulanAwal - 1]} – ${BULAN_NAMES[bulanAkhir - 1]} ${tahun}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.orgBlock}>
            <Text style={styles.orgName}>{rtName.toUpperCase()}</Text>
            <Text style={styles.orgSub}>{rtAddress}</Text>
          </View>
          <View style={styles.reportBlock}>
            <Text style={styles.reportLabel}>LAPORAN KEUANGAN</Text>
            <Text style={styles.periodLabel}>Periode: {periodLabel}</Text>
            <Text style={styles.printedAt}>Dicetak: {fmtDateTime(new Date())}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Stat cards ── */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statTitle}>TOTAL PEMASUKAN</Text>
            <Text style={styles.statValueGreen}>{fmt(totalMasuk)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statTitle}>TOTAL PENGELUARAN</Text>
            <Text style={styles.statValueRed}>{fmt(totalKeluar)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statTitle}>SALDO AKHIR PERIODE</Text>
            <Text style={styles.statValue}>{fmt(saldo)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>JUMLAH TRANSAKSI</Text>
            <Text style={styles.statValue}>{data.length} transaksi</Text>
          </View>
        </View>

        {/* ── Table header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNo]}>No</Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>Tanggal</Text>
          <Text style={[styles.tableHeaderText, styles.colUraian]}>Uraian</Text>
          <Text style={[styles.tableHeaderText, styles.colKategori]}>Kategori</Text>
          <Text style={[styles.tableHeaderText, styles.colMasuk, { textAlign: "right" }]}>Pemasukan</Text>
          <Text style={[styles.tableHeaderText, styles.colKeluar, { textAlign: "right" }]}>Pengeluaran</Text>
          <Text style={[styles.tableHeaderText, styles.colSaldo, { textAlign: "right" }]}>Saldo</Text>
        </View>

        {/* ── Table rows ── */}
        {(() => {
          let running = 0;
          return data.map((item, index) => {
            running += item.tipeArus === "masuk" ? item.nominal : -item.nominal;
            const snap = running;
            const uraian = item.keterangan ?? (item.namaWarga ? `${item.namaWarga} (${item.blokRumah})` : "-");
            const isAlt = index % 2 !== 0;

            return (
              <View key={item.id} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                <Text style={styles.colNo}>{index + 1}</Text>
                <Text style={styles.colDate}>{fmtDate(item.waktuTransaksi)}</Text>
                <View style={styles.colUraian}>
                  <Text style={{ fontSize: 8, color: C.textDark }}>{uraian}</Text>
                  {item.namaWarga && item.keterangan && (
                    <Text style={styles.cellMuted}>
                      {item.namaWarga} — {item.blokRumah}
                    </Text>
                  )}
                </View>
                <Text style={[styles.colKategori, { color: C.textMuted }]}>{item.namaKategori ?? "-"}</Text>
                <Text style={[styles.colMasuk, item.tipeArus === "masuk" ? styles.cellGreen : {}]}>
                  {item.tipeArus === "masuk" ? fmt(item.nominal) : "-"}
                </Text>
                <Text style={[styles.colKeluar, item.tipeArus === "keluar" ? styles.cellRed : {}]}>
                  {item.tipeArus === "keluar" ? fmt(item.nominal) : "-"}
                </Text>
                <Text style={[styles.colSaldo, snap < 0 ? styles.cellRed : {}]}>{fmt(snap)}</Text>
              </View>
            );
          });
        })()}

        {data.length === 0 && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: C.textMuted }}>Tidak ada transaksi pada periode ini.</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{rtName} — Sistem Manajemen Keuangan RT</Text>
          <Text style={styles.footerText}>
            Periode: {periodLabel} | {data.length} transaksi
          </Text>
        </View>
      </Page>
    </Document>
  );
}
