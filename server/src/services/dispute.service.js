import Appointment from "../models/appointment.model.js";
import Dispute, { DISPUTE_STATUSES } from "../models/dispute.model.js";
import { createHttpError } from "../utils/httpError.js";

const BASE_POPULATE = [
  { path: "clientId", select: "name email" },
  { path: "pswId", select: "name email" },
  { path: "appointmentId", select: "appointmentDate appointmentTime status" },
  { path: "resolvedBy", select: "name email" },
];

const applyPopulate = (query) => {
  let populated = query;

  for (const config of BASE_POPULATE) {
    populated = populated.populate(config.path, config.select);
  }

  return populated;
};

const assertValidStatus = (status) => {
  if (!status) {
    return;
  }

  if (!DISPUTE_STATUSES.includes(status)) {
    throw createHttpError(
      400,
      `Invalid dispute status. Allowed: ${DISPUTE_STATUSES.join(", ")}.`,
    );
  }
};

export const createClientDispute = async ({ actor, payload }) => {
  if (actor.role !== "client") {
    throw createHttpError(403, "Only clients can report disputes.");
  }

  const appointmentId = String(payload.appointmentId || "").trim();
  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();

  if (!appointmentId || !title || !description) {
    throw createHttpError(
      400,
      "appointmentId, title, and description are required.",
    );
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  if (String(appointment.clientId) !== String(actor._id)) {
    throw createHttpError(
      403,
      "You can only report issues for your own appointments.",
    );
  }

  const dispute = await Dispute.create({
    appointmentId: appointment._id,
    clientId: actor._id,
    pswId: appointment.pswId,
    title,
    description,
    status: "open",
  });

  return applyPopulate(Dispute.findById(dispute._id));
};

export const listClientDisputes = async ({ actor, status }) => {
  if (actor.role !== "client") {
    throw createHttpError(403, "Only clients can view personal disputes.");
  }

  assertValidStatus(status);

  const query = { clientId: actor._id };

  if (status) {
    query.status = status;
  }

  return applyPopulate(Dispute.find(query).sort({ createdAt: -1 }));
};

export const getDisputeByIdForActor = async ({ disputeId, actor }) => {
  const dispute = await applyPopulate(Dispute.findById(disputeId));

  if (!dispute) {
    throw createHttpError(404, "Dispute not found.");
  }

  if (actor.role === "admin") {
    return dispute;
  }

  if (
    actor.role === "client" &&
    String(dispute.clientId?._id || dispute.clientId) === String(actor._id)
  ) {
    return dispute;
  }

  throw createHttpError(403, "You do not have access to this dispute.");
};

export const listAdminDisputes = async ({ status }) => {
  assertValidStatus(status);

  const query = {};

  if (status) {
    query.status = status;
  }

  return applyPopulate(Dispute.find(query).sort({ createdAt: -1 }));
};

export const getAdminDisputeById = async ({ disputeId }) => {
  const dispute = await applyPopulate(Dispute.findById(disputeId));

  if (!dispute) {
    throw createHttpError(404, "Dispute not found.");
  }

  return dispute;
};

export const updateAdminDisputeStatus = async ({
  disputeId,
  status,
  resolutionNote,
  adminUserId,
}) => {
  assertValidStatus(status);

  const dispute = await Dispute.findById(disputeId);

  if (!dispute) {
    throw createHttpError(404, "Dispute not found.");
  }

  dispute.status = status;
  dispute.resolutionNote = String(resolutionNote || "").trim();

  if (status === "resolved") {
    dispute.resolvedBy = adminUserId;
    dispute.resolvedAt = new Date();
  } else {
    dispute.resolvedBy = null;
    dispute.resolvedAt = null;
  }

  await dispute.save();

  return applyPopulate(Dispute.findById(dispute._id));
};
