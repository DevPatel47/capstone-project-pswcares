import Certificate from "../models/certificate.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import { uploadFileToS3 } from "./upload.service.js";
import { createHttpError } from "../utils/httpError.js";

const normalizeServices = (services) => {
  if (!services) {
    return [];
  }

  if (Array.isArray(services)) {
    return services.map((service) => String(service).trim()).filter(Boolean);
  }

  if (typeof services === "string") {
    return services
      .split(",")
      .map((service) => service.trim())
      .filter(Boolean);
  }

  return [];
};

const validateProfilePayload = ({
  bio,
  services,
  hourlyRate,
  experience,
  location,
}) => {
  if (typeof bio !== "undefined" && String(bio).trim().length > 2000) {
    throw createHttpError(400, "Bio cannot exceed 2000 characters.");
  }

  const normalizedServices = normalizeServices(services);

  if (!Number.isFinite(Number(hourlyRate)) || Number(hourlyRate) < 0) {
    throw createHttpError(400, "hourlyRate must be a non-negative number.");
  }

  if (!Number.isFinite(Number(experience)) || Number(experience) < 0) {
    throw createHttpError(400, "experience must be a non-negative number.");
  }

  if (!location || !String(location).trim()) {
    throw createHttpError(400, "location is required.");
  }

  return {
    bio: String(bio || "").trim(),
    services: normalizedServices,
    hourlyRate: Number(hourlyRate),
    experience: Number(experience),
    location: String(location).trim(),
  };
};

export const upsertPSWProfile = async ({ userId, payload }) => {
  const validated = validateProfilePayload(payload);

  const profile = await PSWProfile.findOneAndUpdate(
    { userId },
    {
      ...validated,
      verificationStatus: "pending",
      verificationNote: "",
      verifiedBy: null,
      verifiedAt: null,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return profile;
};

export const getPSWProfileWithCertificates = async ({ userId }) => {
  const profile = await PSWProfile.findOne({ userId });

  if (!profile) {
    throw createHttpError(404, "PSW profile not found.");
  }

  const certificates = await Certificate.find({
    pswProfileId: profile._id,
  }).sort({
    createdAt: -1,
  });

  return { profile, certificates };
};

export const uploadPSWCertificate = async ({ userId, file }) => {
  if (!file) {
    throw createHttpError(400, "Certificate file is required.");
  }

  const profile = await PSWProfile.findOne({ userId });

  if (!profile) {
    throw createHttpError(
      400,
      "Create PSW profile before uploading certificates.",
    );
  }

  const uploadResult = await uploadFileToS3({
    file,
    uploadType: "certificates",
  });

  const certificate = await Certificate.create({
    userId,
    pswProfileId: profile._id,
    fileUrl: uploadResult.fileUrl,
    s3Key: uploadResult.key,
    originalFileName: file.originalname || "",
  });

  if (profile.verificationStatus !== "pending") {
    profile.verificationStatus = "pending";
    profile.verificationNote = "";
    profile.verifiedBy = null;
    profile.verifiedAt = null;
    await profile.save();
  }

  return certificate;
};

export const getPendingPSWProfiles = async () => {
  const pendingProfiles = await PSWProfile.find({
    verificationStatus: "pending",
  })
    .populate("userId", "name email role status")
    .sort({ createdAt: 1 });

  const profileIds = pendingProfiles.map((profile) => profile._id);

  const certificates = await Certificate.find({
    pswProfileId: { $in: profileIds },
  }).sort({ createdAt: -1 });

  const certificateMap = new Map();

  for (const cert of certificates) {
    const key = String(cert.pswProfileId);
    if (!certificateMap.has(key)) {
      certificateMap.set(key, []);
    }
    certificateMap.get(key).push(cert);
  }

  return pendingProfiles.map((profile) => ({
    profile,
    certificates: certificateMap.get(String(profile._id)) || [],
  }));
};

export const setPSWVerificationStatus = async ({
  profileId,
  status,
  note,
  adminUserId,
}) => {
  if (!["approved", "rejected"].includes(status)) {
    throw createHttpError(400, "status must be either approved or rejected.");
  }

  const profile = await PSWProfile.findById(profileId);

  if (!profile) {
    throw createHttpError(404, "PSW profile not found.");
  }

  profile.verificationStatus = status;
  profile.verificationNote = String(note || "").trim();
  profile.verifiedBy = adminUserId;
  profile.verifiedAt = new Date();

  await profile.save();

  return profile;
};

export const searchVerifiedPSWProfiles = async ({
  location,
  service,
  minExperience,
  page,
  limit,
}) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const safeLimit =
    Number.isNaN(parsedLimit) || parsedLimit < 1
      ? 10
      : Math.min(parsedLimit, 50);

  const query = {
    verificationStatus: "approved",
  };

  if (location && String(location).trim()) {
    query.location = {
      $regex: String(location).trim(),
      $options: "i",
    };
  }

  if (service && String(service).trim()) {
    query.services = {
      $elemMatch: {
        $regex: `^${String(service)
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    };
  }

  if (typeof minExperience !== "undefined") {
    const parsedExperience = Number(minExperience);

    if (Number.isFinite(parsedExperience) && parsedExperience >= 0) {
      query.experience = { $gte: parsedExperience };
    }
  }

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    PSWProfile.find(query)
      .populate("userId", "name")
      .sort({ verifiedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    PSWProfile.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
    filters: {
      location: location || null,
      service: service || null,
      minExperience:
        typeof minExperience === "undefined" ? null : Number(minExperience),
    },
  };
};
