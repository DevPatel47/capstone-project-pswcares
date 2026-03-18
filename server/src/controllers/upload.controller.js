import { uploadFileToS3 } from "../services/upload.service.js";
import { createHttpError } from "../utils/httpError.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createHttpError(
        400,
        "No file uploaded. Use form-data field name 'file'.",
      );
    }

    const result = await uploadFileToS3({
      file: req.file,
      uploadType: req.params.type,
    });

    res.status(201).json({
      message: "File uploaded successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
