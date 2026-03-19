import Appointment from "../models/appointment.model.js";
import Dispute from "../models/dispute.model.js";
import Payment from "../models/payment.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import {
  getPendingPSWProfiles,
  setPSWVerificationStatus,
} from "./pswProfile.service.js";
import {
  getAdminDisputeById,
  listAdminDisputes,
  updateAdminDisputeStatus,
} from "./dispute.service.js";

export const getAdminUsers = async ({ page, limit, role, status, search }) => {
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100,
  );

  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (search && String(search).trim()) {
    query.$or = [
      { name: { $regex: String(search).trim(), $options: "i" } },
      { email: { $regex: String(search).trim(), $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

export const getAdminVerificationQueue = async () => {
  return getPendingPSWProfiles();
};

export const updateAdminVerification = async ({
  profileId,
  status,
  note,
  adminUserId,
}) => {
  return setPSWVerificationStatus({
    profileId,
    status,
    note,
    adminUserId,
  });
};

export const getAdminDisputes = async ({ status }) => {
  return listAdminDisputes({ status });
};

export const getAdminDisputeDetails = async ({ disputeId }) => {
  return getAdminDisputeById({ disputeId });
};

export const updateAdminDispute = async ({
  disputeId,
  status,
  resolutionNote,
  adminUserId,
}) => {
  return updateAdminDisputeStatus({
    disputeId,
    status,
    resolutionNote,
    adminUserId,
  });
};

export const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalClients,
    totalPSWs,
    totalAdmins,
    pendingVerifications,
    approvedPSWs,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    totalPayments,
    successfulPayments,
    totalReviews,
    openDisputes,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "psw" }),
    User.countDocuments({ role: "admin" }),
    PSWProfile.countDocuments({ verificationStatus: "pending" }),
    PSWProfile.countDocuments({ verificationStatus: "approved" }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "confirmed" }),
    Appointment.countDocuments({ status: "completed" }),
    Payment.countDocuments(),
    Payment.countDocuments({ status: "succeeded" }),
    Review.countDocuments(),
    Dispute.countDocuments({ status: { $in: ["open", "in_review"] } }),
  ]);

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      psws: totalPSWs,
      admins: totalAdmins,
    },
    verification: {
      pending: pendingVerifications,
      approved: approvedPSWs,
    },
    appointments: {
      total: totalAppointments,
      confirmed: confirmedAppointments,
      completed: completedAppointments,
    },
    payments: {
      total: totalPayments,
      succeeded: successfulPayments,
    },
    reviews: {
      total: totalReviews,
    },
    disputes: {
      open: openDisputes,
    },
  };
};
