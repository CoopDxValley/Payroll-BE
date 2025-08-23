import ExcelJS from "exceljs";

export const toString = (value: ExcelJS.CellValue): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "result" in value)
    return value.result?.toString();
  return undefined;
};

export const toDate = (value: ExcelJS.CellValue): Date | undefined => {
  const strValue = toString(value);
  if (!strValue) return undefined;
  const date = new Date(strValue);
  return isNaN(date.getTime()) ? undefined : date;
};
// Helper function to safely convert cell value to number
export const toNumber = (value: ExcelJS.CellValue): number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};
