import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { NextFunction } from "express";

// // Initial import log
// console.log("📦 Multer config file loaded");

// const fileFilter = (_req: any, file: any, cb: any) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];

//   console.log(
//     `🛡️ File filter triggered for: ${file.originalname} (ext: ${ext})`
//   );

//   if (dangerousExtensions.includes(ext)) {
//     console.warn("❌ Rejected dangerous file:", file.originalname);
//     return cb(new Error("File type not allowed"), false);
//   }

//   console.log("✅ File accepted by filter:", file.originalname);
//   cb(null, true);
// };

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, "..", "uploads", "documents");
// if (!fs.existsSync(uploadDir)) {
//   console.log("📁 Upload directory does not exist, creating:", uploadDir);
//   fs.mkdirSync(uploadDir, { recursive: true });
// } else {
//   console.log("📁 Upload directory exists:", uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     console.log("📍 Setting upload destination to:", uploadDir);
//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const finalName =
//       file.fieldname +
//       "-" +
//       uniqueSuffix +
//       "." +
//       file.originalname.split(".").pop();

//     console.log("📝 Generated filename:", finalName);
//     cb(null, finalName);
//   },
// });

// export const multipleImageUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 5MB per file
// }).array("files", 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("object", req.files);
    cb(null, path.join(__dirname, "..", "uploads", "documents"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("🔍 Received file:", file.originalname, file.mimetype);
  cb(null, true);
};

// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

export const multipleImageUpload = multer({
  storage,
  // fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB per file
}).array("documents", 10);

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 20 MB limit
  },
});
