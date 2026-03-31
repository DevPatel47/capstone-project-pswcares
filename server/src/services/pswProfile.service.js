import Certificate from "../models/certificate.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import { AVAILABILITY_DAYS } from "../models/pswProfile.model.js";
import { getSignedS3ReadUrl } from "../config/s3.js";
import { uploadFileToS3 } from "./upload.service.js";
import { createHttpError } from "../utils/httpError.js";

const attachSignedUrl = async (certificate) => {
  const item =
    typeof certificate.toObject === "function"
      ? certificate.toObject()
      : { ...certificate };

  if (!item.s3Key) {
    return item;
  }

  const signedUrl = await getSignedS3ReadUrl(item.s3Key);

  return {
    ...item,
    fileUrl: signedUrl,
  };
};

const attachSignedUrls = async (certificates) => {
  return Promise.all((certificates || []).map((item) => attachSignedUrl(item)));
};

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

const isValidTime = (value) =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
};

const normalizeAvailability = (availability) => {
  if (!availability) {
    return [];
  }

  if (!Array.isArray(availability)) {
    throw createHttpError(400, "availability must be an array of time slots.");
  }

  const normalized = availability
    .map((slot) => ({
      dayOfWeek: String(slot?.dayOfWeek || "")
        .trim()
        .toLowerCase(),
      startTime: String(slot?.startTime || "").trim(),
      endTime: String(slot?.endTime || "").trim(),
    }))
    .filter((slot) => slot.dayOfWeek || slot.startTime || slot.endTime);

  for (const slot of normalized) {
    if (!AVAILABILITY_DAYS.includes(slot.dayOfWeek)) {
      throw createHttpError(
        400,
        `Invalid availability day: ${slot.dayOfWeek || "unknown"}.`,
      );
    }

    if (!isValidTime(slot.startTime) || !isValidTime(slot.endTime)) {
      throw createHttpError(
        400,
        "availability startTime/endTime must use HH:mm format.",
      );
    }

    if (timeToMinutes(slot.endTime) <= timeToMinutes(slot.startTime)) {
      throw createHttpError(
        400,
        "availability endTime must be later than startTime.",
      );
    }
  }

  return normalized;
};

const validateProfilePayload = ({
  bio,
  services,
  hourlyRate,
  experience,
  location,
  availability,
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

  const normalizedAvailability = normalizeAvailability(availability);

  return {
    bio: String(bio || "").trim(),
    services: normalizedServices,
    hourlyRate: Number(hourlyRate),
    experience: Number(experience),
    location: String(location).trim(),
    availability: normalizedAvailability,
  };
};

export const upsertPSWProfile = async ({ userId, payload }) => {
  if (!userId) {
    throw createHttpError(400, "userId is required.");
  }

  const validated = validateProfilePayload(payload);
  const existingProfile = await PSWProfile.findOne({ userId });

  if (!existingProfile) {
    const created = await PSWProfile.create({
      userId,
      ...validated,
      verificationStatus: "pending",
      verificationNote: "",
      verifiedBy: null,
      verifiedAt: null,
    });

    return created;
  }

  const coreProfileChanged =
    existingProfile.bio !== validated.bio ||
    Number(existingProfile.hourlyRate) !== Number(validated.hourlyRate) ||
    Number(existingProfile.experience) !== Number(validated.experience) ||
    existingProfile.location !== validated.location ||
    JSON.stringify(existingProfile.services || []) !==
      JSON.stringify(validated.services || []);

  existingProfile.set(validated);

  if (coreProfileChanged && existingProfile.verificationStatus !== "pending") {
    existingProfile.verificationStatus = "pending";
    existingProfile.verificationNote = "";
    existingProfile.verifiedBy = null;
    existingProfile.verifiedAt = null;
  }

  await existingProfile.save();

  return existingProfile;
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

  return { profile, certificates: await attachSignedUrls(certificates) };
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

  return attachSignedUrl(certificate);
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

  const hydratedMap = new Map();

  for (const [profileId, certList] of certificateMap.entries()) {
    hydratedMap.set(profileId, await attachSignedUrls(certList));
  }

  return pendingProfiles.map((profile) => ({
    profile,
    certificates: hydratedMap.get(String(profile._id)) || [],
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
      .sort({ averageRating: -1, verifiedAt: -1, createdAt: -1 })
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

export const getPublicApprovedPSWProfileById = async ({ profileId }) => {
  const profile = await PSWProfile.findOne({
    _id: profileId,
    verificationStatus: "approved",
  }).populate("userId", "name");

  if (!profile) {
    throw createHttpError(404, "Profile not found.");
  }

  const certificates = await Certificate.find({
    pswProfileId: profile._id,
  })
    .select("_id originalFileName fileUrl s3Key createdAt")
    .sort({ createdAt: -1 });

  return {
    profile,
    certificates: await attachSignedUrls(certificates),
    reviews: [],
  };
};
