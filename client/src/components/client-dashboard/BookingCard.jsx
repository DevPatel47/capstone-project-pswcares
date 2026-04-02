import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(value));
};

const getServiceType = (notes) => {
  if (!notes) return "General care";
  const [firstPart] = String(notes).split("|");
  return firstPart?.trim() || "General care";
};

const BookingCard = ({
  booking,
  onCancel,
  onReschedule,
  onPay,
  canPay,
  canCancel,
}) => {
  const pswName = booking.pswId?.name || "PSW";
  const canManage = ["pending", "confirmed"].includes(booking.status);
  const canMessage = booking.status === "confirmed";
  const allowCancel = typeof canCancel === "boolean" ? canCancel : canManage;
  const serviceType = getServiceType(booking.notes);

  return (
    <article className="rounded-2xl border border-brand-100/60 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {serviceType}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{pswName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(booking.appointmentDate)} at {booking.appointmentTime}
          </p>
          <p className="text-xs text-slate-400">
            Duration: {booking.durationMinutes} min
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[booking.status] || "info"}>
          {booking.status}
        </Badge>
      </div>

      <div
        className={`mt-4 grid grid-cols-1 gap-2 ${canPay ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
      >
        {canMessage ? (
          <Link
            className="btn-outline btn-sm text-center"
            to={`/client/chat?appointmentId=${encodeURIComponent(booking._id)}`}
          >
            Send message
          </Link>
        ) : (
          <button
            className="btn-outline btn-sm text-center"
            disabled
            type="button"
            title="Messaging unlocks after the booking is confirmed."
          >
            Send message
          </button>
        )}
        {canPay ? (
          <button
            className="btn-primary btn-sm"
            onClick={() => onPay(booking)}
            type="button"
          >
            Pay now
          </button>
        ) : null}
        <button
          className="btn-outline btn-sm"
          disabled={!canManage}
          onClick={() => onReschedule(booking)}
          type="button"
        >
          Reschedule
        </button>
        <button
          className="btn-outline btn-sm !border-rose-200 !text-rose-700 hover:!bg-rose-50"
          disabled={!allowCancel}
          onClick={() => onCancel(booking)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </article>
  );
};

export default BookingCard;
