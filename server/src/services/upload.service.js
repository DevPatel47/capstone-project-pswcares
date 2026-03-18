import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import { env } from "../config/env.js";
import { getS3FileUrl, s3Client } from "../config/s3.js";
import { createHttpError } from "../utils/httpError.js";

const uploadTypeConfig = {
  certificates: {
    prefix: "certificates",
    allowedMimeTypes: new Set([
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]),
  },
  "profile-images": {
    prefix: "profile-images",
    allowedMimeTypes: new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]),
  },
};

const createS3Key = (typePrefix, fileName) => {
  const extension = path.extname(fileName || "").toLowerCase();
  const safeExtension = extension.slice(0, 10);

  return `${typePrefix}/${Date.now()}-${randomUUID()}${safeExtension}`;
};

export const uploadFileToS3 = async ({ file, uploadType }) => {
  const config = uploadTypeConfig[uploadType];

  if (!config) {
    throw createHttpError(
      400,
      "Invalid upload type. Allowed types: certificates, profile-images.",
    );
  }

  if (!file) {
    throw createHttpError(400, "File is required.");
  }

  if (!config.allowedMimeTypes.has(file.mimetype)) {
    throw createHttpError(
      400,
      "This file type is not allowed for the selected upload type.",
    );
  }

  const key = createS3Key(config.prefix, file.originalname);

  const command = new PutObjectCommand({
    Bucket: env.awsS3Bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw createHttpError(502, `S3 upload failed: ${error.message}`);
  }

  return {
    key,
    fileUrl: getS3FileUrl(key),
  };
};
