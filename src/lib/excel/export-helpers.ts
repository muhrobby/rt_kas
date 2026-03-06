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
  title?: string;
}

export async function generateExcelBuffer<T extends Record<string, unknown>>(
  options: ExportToExcelOptions<T>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Kas RT";
  const sheet = workbook.addWorksheet(options.sheetName);

  if (options.title) {
    sheet.addRow([options.title]);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([]);
  }

  const headerRowIndex = options.title ? 3 : 1;

  sheet.columns = options.columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };
  headerRow.border = {
    bottom: { style: "thin" },
  };

  for (const item of options.data) {
    sheet.addRow(item);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
