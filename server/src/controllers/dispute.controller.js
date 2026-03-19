import {
  createClientDispute,
  getDisputeByIdForActor,
  listClientDisputes,
} from "../services/dispute.service.js";

export const createMyDispute = async (req, res, next) => {
  try {
    const dispute = await createClientDispute({
      actor: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Dispute submitted.",
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDisputes = async (req, res, next) => {
  try {
    const items = await listClientDisputes({
      actor: req.user,
      status: req.query.status,
    });

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
    const dispute = await getDisputeByIdForActor({
      disputeId: req.params.disputeId,
      actor: req.user,
    });

    res.status(200).json({ dispute });
  } catch (error) {
    next(error);
  }
};
