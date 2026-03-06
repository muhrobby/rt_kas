import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 10, textAlign: "center", marginBottom: 20, color: "#555" },
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
  cellNo: { width: 24, fontSize: 9 },
  cellWaktu: { width: 70, fontSize: 9 },
  cellPetugas: { width: 70, fontSize: 9 },
  cellModul: { width: 60, fontSize: 9 },
  cellAksi: { width: 40, fontSize: 9 },
  cellKeterangan: { flex: 1, fontSize: 9 },
  footer: { marginTop: 24, fontSize: 8, textAlign: "center", color: "#888" },
});

function formatWaktuPDF(date: Date): string {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface LogPDFItem {
  id: number;
  waktuLog: Date;
  petugasName: string;
  modul: string;
  aksi: string;
  keterangan: string;
}

interface LogAktivitasPDFProps {
  data: LogPDFItem[];
  generatedAt: string;
}

export function LogAktivitasPDF({ data, generatedAt }: LogAktivitasPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>LOG AKTIVITAS ADMIN</Text>
        <Text style={styles.subtitle}>Sistem Manajemen Keuangan RT — Dicetak: {generatedAt}</Text>

        <View style={styles.headerRow}>
          <Text style={styles.cellNo}>No</Text>
          <Text style={styles.cellWaktu}>Waktu</Text>
          <Text style={styles.cellPetugas}>Petugas</Text>
          <Text style={styles.cellModul}>Modul</Text>
          <Text style={styles.cellAksi}>Aksi</Text>
          <Text style={styles.cellKeterangan}>Deskripsi</Text>
        </View>

        {data.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.cellNo}>{index + 1}</Text>
            <Text style={styles.cellWaktu}>{formatWaktuPDF(item.waktuLog)}</Text>
            <Text style={styles.cellPetugas}>{item.petugasName}</Text>
            <Text style={styles.cellModul}>{item.modul}</Text>
            <Text style={styles.cellAksi}>{item.aksi}</Text>
            <Text style={styles.cellKeterangan}>{item.keterangan}</Text>
          </View>
        ))}

        <Text style={styles.footer}>Total {data.length} entri | Sistem Kas RT</Text>
      </Page>
    </Document>
  );
}
