import {
  getAdminAnalytics,
  getAdminDisputeDetails,
  getAdminDisputes,
  getAdminUsers,
  getAdminVerificationQueue,
  updateAdminDispute,
  updateAdminVerification,
} from "../services/admin.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const result = await getAdminUsers({
      page: req.query.page,
      limit: req.query.limit,
      role: req.query.role,
      status: req.query.status,
      search: req.query.search,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getVerificationQueue = async (_req, res, next) => {
  try {
    const items = await getAdminVerificationQueue();

    res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVerification = async (req, res, next) => {
  try {
    const profile = await updateAdminVerification({
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

export const getDisputes = async (req, res, next) => {
  try {
    const items = await getAdminDisputes({ status: req.query.status });

    res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const getDisputeDetails = async (req, res, next) => {
  try {
    const dispute = await getAdminDisputeDetails({
      disputeId: req.params.disputeId,
    });

    res.status(200).json({
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDispute = async (req, res, next) => {
  try {
    const dispute = await updateAdminDispute({
      disputeId: req.params.disputeId,
      status: req.body.status,
      resolutionNote: req.body.resolutionNote,
      adminUserId: req.user._id,
    });

    res.status(200).json({
      message: "Dispute updated.",
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req, res, next) => {
  try {
    const analytics = await getAdminAnalytics();

    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
