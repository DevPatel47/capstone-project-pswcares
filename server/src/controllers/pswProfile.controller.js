import {
  getPSWProfileWithCertificates,
  getPendingPSWProfiles,
  setPSWVerificationStatus,
  uploadPSWCertificate,
  upsertPSWProfile,
} from "../services/pswProfile.service.js";
import { createHttpError } from "../utils/httpError.js";

export const upsertMyPSWProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "psw") {
      throw createHttpError(403, "Only PSW users can manage PSW profiles.");
    }

    const profile = await upsertPSWProfile({
      userId: req.user._id,
      payload: req.body,
    });

    res.status(200).json({
      message: "PSW profile saved successfully.",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPSWProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "psw") {
      throw createHttpError(403, "Only PSW users can access PSW profile.");
    }

    const result = await getPSWProfileWithCertificates({
      userId: req.user._id,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const uploadMyCertificate = async (req, res, next) => {
  try {
    if (req.user.role !== "psw") {
      throw createHttpError(403, "Only PSW users can upload certificates.");
    }

    const certificate = await uploadPSWCertificate({
      userId: req.user._id,
      file: req.file,
    });

    res.status(201).json({
      message: "Certificate uploaded successfully.",
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingPSWsForAdmin = async (_req, res, next) => {
  try {
    const pending = await getPendingPSWProfiles();

    res.status(200).json({
      count: pending.length,
      items: pending,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePSWVerificationByAdmin = async (req, res, next) => {
  try {
    const profile = await setPSWVerificationStatus({
      profileId: req.params.profileId,
      status: req.body.status,
      note: req.body.note,
      adminUserId: req.user._id,
    });

    res.status(200).json({
      message: `PSW profile ${profile.verificationStatus}.`,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
