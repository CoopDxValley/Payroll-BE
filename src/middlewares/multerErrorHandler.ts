import { ErrorRequestHandler } from "express";
import multer from "multer";

export const multerErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): void => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    res.status(400).json({ message: err.message });
    return;
  }

  if (err) {
    console.error("Unknown upload error:", err);
    res.status(503).json({ message: "File upload failed" });
    return;
  }

  // fallback (technically won't happen since this only runs when there's an error)
  res.status(503).json({ message: "Unknown error occurred" });
};
