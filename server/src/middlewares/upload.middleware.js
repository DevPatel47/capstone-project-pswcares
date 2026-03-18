import multer from "multer";
import { createHttpError } from "../utils/httpError.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

export const uploadSingleFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(
        createHttpError(
          400,
          "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG, WEBP.",
        ),
      );
      return;
    }

    cb(null, true);
  },
}).single("file");
