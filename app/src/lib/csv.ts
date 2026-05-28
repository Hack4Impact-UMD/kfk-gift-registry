export type CsvColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

export function serializeCsv<T>(
  rows: Array<T>,
  columns: Array<CsvColumn<T>>,
): string {
  const headerRow = columns.map((column) => serializeCsvCell(column.header));
  const dataRows = rows.map((row) =>
    columns.map((column) => serializeCsvCell(column.value(row))),
  );

  return [headerRow, ...dataRows].map((row) => row.join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function serializeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let stringValue = value instanceof Date ? value.toISOString() : String(value);

  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}
