import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// Allowed extensions & MIME types
const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls (legacy)
];

// Multer storage: keep in memory (avoid saving untrusted files to disk)
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!isAllowedExt || !isAllowedMime) {
    return cb(
      new Error(
        "Invalid file type. Only Excel (.xls, .xlsx) files are allowed."
      )
    );
  }
  cb(null, true);
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only 1 file allowed
  },
});
