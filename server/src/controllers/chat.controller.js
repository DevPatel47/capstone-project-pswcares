import { getChatMessages } from "../services/chat.service.js";

export const getMessagesByAppointment = async (req, res, next) => {
  try {
    const result = await getChatMessages({
      appointmentId: req.params.appointmentId,
      actor: req.user,
    });

    res.status(200).json({
      appointmentId: String(result.appointment._id),
      count: result.messages.length,
      items: result.messages,
    });
  } catch (error) {
    next(error);
  }
};
