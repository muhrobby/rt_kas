import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// ── Styles ────────────────────────────────────────────────────────────────────

const C = {
  primary: "#1a56db",
  primaryLight: "#e8f0fe",
  textDark: "#111827",
  textMid: "#374151",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  borderDark: "#d1d5db",
  green: "#059669",
  bg: "#ffffff",
  rowAlt: "#f9fafb",
} as const;

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.textDark,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  orgBlock: { flexDirection: "column", gap: 2 },
  orgName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    letterSpacing: 0.5,
  },
  orgSub: { fontSize: 8, color: C.textMuted, marginTop: 2 },

  invoiceBlock: { alignItems: "flex-end" },
  invoiceLabel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.textDark,
    letterSpacing: 1,
  },
  refNumber: {
    fontSize: 8,
    color: C.textMuted,
    fontFamily: "Helvetica",
    marginTop: 3,
  },
  statusPaid: {
    marginTop: 6,
    backgroundColor: "#d1fae5",
    color: C.green,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textAlign: "center",
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 1,
    borderColor: C.borderDark,
    marginBottom: 16,
  },
  dividerThin: {
    borderBottomWidth: 0.5,
    borderColor: C.border,
    marginVertical: 10,
  },

  // ── Meta row (tanggal + warga) ─────────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 16,
  },
  metaBlock: { flex: 1 },
  metaTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  metaValue: { fontSize: 9, color: C.textDark },
  metaValueBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.textDark },
  metaValueSub: { fontSize: 8, color: C.textMuted, marginTop: 1 },

  // ── Item table ────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
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
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: C.border,
  },
  tableRowAlt: {
    backgroundColor: C.rowAlt,
  },
  colNo: { width: 20 },
  colUraian: { flex: 1 },
  colQty: { width: 36, textAlign: "center" },
  colSatuan: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  cellText: { fontSize: 9, color: C.textDark },
  cellTextMuted: { fontSize: 8, color: C.textMuted },
  cellRight: { fontSize: 9, color: C.textDark, textAlign: "right" },
  cellCenter: { fontSize: 9, color: C.textDark, textAlign: "center" },

  // ── Summary box ───────────────────────────────────────────────────────────
  summaryBox: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 220,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: 9, color: C.textMuted },
  summaryValue: { fontSize: 9, color: C.textDark },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: C.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginTop: 4,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  totalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" },

  // ── Note ─────────────────────────────────────────────────────────────────
  noteBox: {
    marginTop: 20,
    padding: 8,
    backgroundColor: C.primaryLight,
    borderLeftWidth: 3,
    borderColor: C.primary,
    borderRadius: 2,
  },
  noteText: { fontSize: 8, color: C.textMid },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
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

function fmtDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KuitansiPDFProps {
  refNumber: string;
  tanggal: Date | string;
  wargaNama: string;
  wargaBlok: string;
  namaKategori: string;
  /** Untuk bulanan: array nama bulan. Untuk sekali bayar: array kosong. */
  bulanTagihan: string[];
  tahunTagihan: number | null;
  nominal: number;
  /** Total yang dibayar. Untuk sekali bayar = nominal. Untuk bulanan = nominal × jumlah bulan. */
  totalDibayar: number;
  keterangan?: string | null;
  rtName?: string;
  rtAddress?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KuitansiPDF({
  refNumber,
  tanggal,
  wargaNama,
  wargaBlok,
  namaKategori,
  bulanTagihan,
  tahunTagihan,
  nominal,
  totalDibayar,
  keterangan,
  rtName = "Kas RT",
  rtAddress = "Sistem Manajemen Keuangan Rukun Tetangga",
}: KuitansiPDFProps) {
  const isSekali = bulanTagihan.length === 0;
  const qty = isSekali ? 1 : bulanTagihan.length;

  const uraianDetail = isSekali
    ? namaKategori
    : bulanTagihan.length === 1
      ? `${namaKategori} — ${bulanTagihan[0]} ${tahunTagihan}`
      : `${namaKategori} — ${bulanTagihan[0]} s/d ${bulanTagihan[bulanTagihan.length - 1]} ${tahunTagihan}`;

  const bulanList = isSekali ? null : bulanTagihan.join(", ");

  return (
    <Document>
      <Page size="A5" orientation="portrait" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.orgBlock}>
            <Text style={styles.orgName}>{rtName.toUpperCase()}</Text>
            <Text style={styles.orgSub}>{rtAddress}</Text>
          </View>
          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceLabel}>KUITANSI</Text>
            <Text style={styles.refNumber}>{refNumber}</Text>
            <Text style={styles.statusPaid}>✓ LUNAS</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Meta ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Diterima dari</Text>
            <Text style={styles.metaValueBold}>{wargaNama}</Text>
            <Text style={styles.metaValueSub}>Blok {wargaBlok}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Tanggal Pembayaran</Text>
            <Text style={styles.metaValue}>{fmtDate(tanggal)}</Text>
            <Text style={styles.metaValueSub}>{fmtTime(tanggal)} WIB</Text>
          </View>
          {!isSekali && tahunTagihan && (
            <View style={styles.metaBlock}>
              <Text style={styles.metaTitle}>Periode</Text>
              <Text style={styles.metaValue}>Tahun {tahunTagihan}</Text>
              <Text style={styles.metaValueSub}>{qty} bulan</Text>
            </View>
          )}
        </View>

        {/* ── Item Table ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNo]}>#</Text>
          <Text style={[styles.tableHeaderText, styles.colUraian]}>Uraian</Text>
          <Text style={[styles.tableHeaderText, styles.colQty, { textAlign: "center" }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colSatuan, { textAlign: "right" }]}>Harga Satuan</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal, { textAlign: "right" }]}>Jumlah</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.cellText, styles.colNo]}>1</Text>
          <View style={styles.colUraian}>
            <Text style={styles.cellText}>{uraianDetail}</Text>
            {bulanList && <Text style={styles.cellTextMuted}>{bulanList}</Text>}
          </View>
          <Text style={[styles.cellCenter, styles.colQty]}>{qty}</Text>
          <Text style={[styles.cellRight, styles.colSatuan]}>{fmt(nominal)}</Text>
          <Text style={[styles.cellRight, styles.colTotal]}>{fmt(totalDibayar)}</Text>
        </View>

        {/* ── Summary ── */}
        <View style={styles.summaryBox}>
          <View style={styles.dividerThin} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(totalDibayar)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Diskon</Text>
            <Text style={styles.summaryValue}>–</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DIBAYAR</Text>
            <Text style={styles.totalValue}>{fmt(totalDibayar)}</Text>
          </View>
        </View>

        {/* ── Note ── */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            {keterangan
              ? `Keterangan: ${keterangan}`
              : "Pembayaran telah diterima. Kuitansi ini diterbitkan secara elektronik oleh sistem Kas RT dan berlaku tanpa tanda tangan basah."}
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{rtName} — Sistem Manajemen Keuangan RT</Text>
          <Text style={styles.footerText}>
            Dicetak: {fmtDate(new Date())} {fmtTime(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
