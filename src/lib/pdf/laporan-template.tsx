import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { RekapItem } from "@/server/actions/laporan";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 10, textAlign: "center", marginBottom: 4, color: "#555" },
  period: { fontSize: 10, textAlign: "center", marginBottom: 20, color: "#555" },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    padding: 4,
    minHeight: 20,
  },
  cell: { flex: 1, fontSize: 9 },
  cellNo: { width: 24, fontSize: 9 },
  cellDate: { width: 60, fontSize: 9 },
  cellUraian: { flex: 2, fontSize: 9 },
  cellAmount: { width: 80, textAlign: "right", fontSize: 9 },
  summarySection: { marginTop: 16, borderTopWidth: 1, borderColor: "#000", paddingTop: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontSize: 10 },
  summaryValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 24, fontSize: 8, textAlign: "center", color: "#888" },
});

function formatRupiahPDF(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDatePDF(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

interface LaporanPDFProps {
  data: RekapItem[];
  bulanAwal: number;
  bulanAkhir: number;
  tahun: number;
}

export function LaporanPDF({ data, bulanAwal, bulanAkhir, tahun }: LaporanPDFProps) {
  const totalMasuk = data.reduce((sum, d) => sum + (d.tipeArus === "masuk" ? d.nominal : 0), 0);
  const totalKeluar = data.reduce((sum, d) => sum + (d.tipeArus === "keluar" ? d.nominal : 0), 0);
  const saldo = totalMasuk - totalKeluar;

  const periodLabel =
    bulanAwal === bulanAkhir
      ? `${BULAN_NAMES[bulanAwal - 1]} ${tahun}`
      : `${BULAN_NAMES[bulanAwal - 1]} – ${BULAN_NAMES[bulanAkhir - 1]} ${tahun}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>LAPORAN KEUANGAN KAS RT</Text>
        <Text style={styles.subtitle}>Sistem Manajemen Keuangan RT</Text>
        <Text style={styles.period}>Periode: {periodLabel}</Text>

        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={styles.cellNo}>No</Text>
          <Text style={styles.cellDate}>Tanggal</Text>
          <Text style={styles.cellUraian}>Uraian</Text>
          <Text style={styles.cellAmount}>Pemasukan</Text>
          <Text style={styles.cellAmount}>Pengeluaran</Text>
          <Text style={styles.cellAmount}>Saldo</Text>
        </View>

        {/* Table Rows */}
        {(() => {
          let running = 0;
          return data.map((item, index) => {
            if (item.tipeArus === "masuk") {
              running += item.nominal;
            } else {
              running -= item.nominal;
            }
            const snap = running;
            const uraian = item.keterangan ?? (item.namaWarga ? `${item.namaWarga} (${item.blokRumah})` : "-");

            return (
              <View key={item.id} style={styles.row}>
                <Text style={styles.cellNo}>{index + 1}</Text>
                <Text style={styles.cellDate}>{formatDatePDF(item.waktuTransaksi)}</Text>
                <Text style={styles.cellUraian}>{uraian}</Text>
                <Text style={styles.cellAmount}>{item.tipeArus === "masuk" ? formatRupiahPDF(item.nominal) : "-"}</Text>
                <Text style={styles.cellAmount}>
                  {item.tipeArus === "keluar" ? formatRupiahPDF(item.nominal) : "-"}
                </Text>
                <Text style={styles.cellAmount}>{formatRupiahPDF(snap)}</Text>
              </View>
            );
          });
        })()}

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Pemasukan</Text>
            <Text style={styles.summaryValue}>{formatRupiahPDF(totalMasuk)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={styles.summaryValue}>{formatRupiahPDF(totalKeluar)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ ...styles.summaryLabel, fontFamily: "Helvetica-Bold" }}>Saldo Akhir</Text>
            <Text style={{ ...styles.summaryValue }}>{formatRupiahPDF(saldo)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Dicetak pada: {new Date().toLocaleString("id-ID")} | Sistem Kas RT</Text>
      </Page>
    </Document>
  );
}
