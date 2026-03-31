import { useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import Avatar from "../components/ui/Avatar";
import PageTransition from "../components/ui/PageTransition";
import { createBookingRequest } from "../services/appointmentApi";

const durationOptions = [30, 60, 90, 120, 180];
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const toMonthLabel = (year, monthIndex) => {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
};

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildMonthCells = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startWeekDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1)
    cells.push(new Date(year, monthIndex, day));
  return cells;
};

const getMinDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const toMinutes = (value) => {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
};

const isWithinAvailability = ({ availability, date, time, duration }) => {
  if (
    !Array.isArray(availability) ||
    availability.length === 0 ||
    !date ||
    !time
  ) {
    return false;
  }

  const dayName = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
  const start = toMinutes(time);
  const end = start + Number(duration);

  return availability.some((slot) => {
    if (slot.dayOfWeek !== dayName) return false;
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    return start >= slotStart && end <= slotEnd;
  });
};

const STEP_LABELS = ["Service", "Date & Time", "Confirm"];

const BookingFlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const profile = location.state?.profile;
  const pswName =
    searchParams.get("pswName") ||
    profile?.userId?.name ||
    profile?.name ||
    "Selected PSW";
  const pswId =
    searchParams.get("pswId") ||
    profile?.userId?._id ||
    (typeof profile?.userId === "string" ? profile.userId : "");
  const suggestedServices = profile?.services || [];
  const hourlyRate = Number(profile?.hourlyRate || 0);
  const availabilityKnown = Array.isArray(profile?.availability);
  const availability = availabilityKnown ? profile.availability : [];

  const minDate = useMemo(() => getMinDate(), []);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const [form, setForm] = useState({
    service: suggestedServices[0] || "",
    notes: "",
    date: "",
    time: "09:00",
    duration: 60,
  });

  const calendarCells = useMemo(
    () => buildMonthCells(calendarYear, calendarMonth),
    [calendarYear, calendarMonth],
  );
  const selectedDateObj = form.date ? new Date(`${form.date}T00:00:00`) : null;
  const canGoNextFromStep1 = form.service.trim().length > 0;
  const isSelectedSlotAvailable = useMemo(
    () =>
      !availabilityKnown ||
      isWithinAvailability({
        availability,
        date: form.date,
        time: form.time,
        duration: Number(form.duration),
      }),
    [availabilityKnown, availability, form.date, form.time, form.duration],
  );
  const canGoNextFromStep2 =
    Boolean(form.date) &&
    Boolean(form.time) &&
    Number(form.duration) >= 15 &&
    isSelectedSlotAvailable;

  const bookingSummary = {
    service: form.service,
    date: form.date,
    time: form.time,
    duration: Number(form.duration),
    notes: form.notes.trim(),
  };

  const estimatedTotal = useMemo(() => {
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) return null;
    return (hourlyRate * Number(form.duration)) / 60;
  }, [form.duration, hourlyRate]);

  const isDateSelectable = (date) => date && date >= minDate;

  const handleMonthShift = (delta) => {
    const next = new Date(calendarYear, calendarMonth + delta, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth());
  };

  const handleCalendarSelect = (date) => {
    if (!isDateSelectable(date)) return;
    setForm((prev) => ({ ...prev, date: toISODate(date) }));
  };

  const handleSubmit = async () => {
    setApiError("");
    if (!pswId) {
      setApiError(
        "Missing PSW selection. Please return to the profile and try again.",
      );
      return;
    }
    if (!isSelectedSlotAvailable) {
      setApiError("Selected time is outside this PSW's availability.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createBookingRequest({
        pswId,
        date: bookingSummary.date,
        time: bookingSummary.time,
        duration: bookingSummary.duration,
        notes: [bookingSummary.service, bookingSummary.notes]
          .filter(Boolean)
          .join(" | "),
      });
      navigate("/client/dashboard", {
        replace: true,
        state: {
          bookingSubmitted: true,
          message:
            "Booking request submitted. Payment unlocks after PSW confirms your time.",
        },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-bg px-4 py-8">
      <PageTransition className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <header className="app-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={pswName} size="lg" />
              <div>
                <p className="page-label">Booking</p>
                <h1 className="page-title !text-2xl">
                  Book care with {pswName}
                </h1>
                <p className="page-subtitle text-sm">
                  Complete the 3-step form to submit a request.
                </p>
              </div>
            </div>
            <Link className="btn-outline btn-sm" to="/client/dashboard">
              ← Dashboard
            </Link>
          </div>

          {/* Progress steps */}
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {STEP_LABELS.map((label, index) => {
              const active = step === index + 1;
              const completed = step > index + 1;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-brand-300 bg-brand-50 text-brand-800"
                      : completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-brand-600 text-white"
                        : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        </header>

        {/* Step content */}
        <section className="app-card">
          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                Select service
              </h2>
              {suggestedServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedServices.map((service) => (
                    <button
                      key={service}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        form.service === service
                          ? "border-brand-300 bg-brand-50 text-brand-800"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
                      }`}
                      onClick={() => setForm((prev) => ({ ...prev, service }))}
                      type="button"
                    >
                      {service}
                    </button>
                  ))}
                </div>
              ) : null}

              <div>
                <label className="app-label" htmlFor="service">
                  Service
                </label>
                <input
                  className="app-input"
                  id="service"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, service: e.target.value }))
                  }
                  placeholder="Example: Elderly care"
                  value={form.service}
                />
              </div>

              <div>
                <label className="app-label" htmlFor="notes">
                  Booking notes (optional)
                </label>
                <textarea
                  className="app-input min-h-28 resize-none"
                  id="notes"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Share specific care needs or context."
                  value={form.notes}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                Choose date and time
              </h2>

              <div className="rounded-xl border border-brand-100/60 bg-brand-50/20 p-3 text-sm text-slate-600">
                {availabilityKnown && availability.length > 0 ? (
                  <p>
                    Available windows:{" "}
                    {availability
                      .map(
                        (slot) =>
                          `${DAY_LABELS[slot.dayOfWeek] || slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`,
                      )
                      .join(" • ")}
                  </p>
                ) : availabilityKnown ? (
                  <p>
                    This PSW has not set availability yet. Booking is currently
                    unavailable.
                  </p>
                ) : (
                  <p>
                    Availability will be validated when you submit your booking.
                  </p>
                )}
              </div>

              {/* Calendar */}
              <div className="rounded-xl border border-brand-100/60 bg-brand-50/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => handleMonthShift(-1)}
                    type="button"
                  >
                    ‹ Prev
                  </button>
                  <p className="text-sm font-bold text-slate-900">
                    {toMonthLabel(calendarYear, calendarMonth)}
                  </p>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => handleMonthShift(1)}
                    type="button"
                  >
                    Next ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <span key={d}>{d}</span>
                    ),
                  )}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {calendarCells.map((date, index) => {
                    if (!date)
                      return <span key={`empty-${index}`} className="h-9" />;
                    const disabled = !isDateSelectable(date);
                    const isSelected =
                      selectedDateObj &&
                      toISODate(selectedDateObj) === toISODate(date);
                    return (
                      <button
                        key={toISODate(date)}
                        className={`h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                            : disabled
                              ? "cursor-not-allowed bg-slate-100 text-slate-300"
                              : "bg-white text-slate-700 hover:bg-brand-50"
                        }`}
                        disabled={disabled}
                        onClick={() => handleCalendarSelect(date)}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="app-label" htmlFor="time">
                    Time
                  </label>
                  <input
                    className="app-input"
                    id="time"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, time: e.target.value }))
                    }
                    type="time"
                    value={form.time}
                  />
                </div>
                <div>
                  <label className="app-label" htmlFor="duration">
                    Duration
                  </label>
                  <select
                    className="app-select"
                    id="duration"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    value={form.duration}
                  >
                    {durationOptions.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.date && form.time && !isSelectedSlotAvailable ? (
                <ErrorBanner message="Selected date/time is outside the PSW's available hours." />
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                Confirm booking
              </h2>
              <div className="rounded-xl border border-brand-100/60 bg-brand-50/20 p-5 space-y-2 text-sm text-slate-700">
                {[
                  ["PSW", pswName],
                  ["Service", bookingSummary.service],
                  ["Date", bookingSummary.date],
                  ["Time", bookingSummary.time],
                  ["Duration", `${bookingSummary.duration} minutes`],
                  [
                    "Estimated total",
                    estimatedTotal !== null
                      ? new Intl.NumberFormat("en-CA", {
                          style: "currency",
                          currency: "CAD",
                        }).format(estimatedTotal)
                      : "Available after profile pricing is loaded",
                  ],
                ].map(([k, v]) => (
                  <p key={k}>
                    <span className="font-semibold text-slate-900">{k}:</span>{" "}
                    {v}
                  </p>
                ))}
                {bookingSummary.notes ? (
                  <p>
                    <span className="font-semibold text-slate-900">Notes:</span>{" "}
                    {bookingSummary.notes}
                  </p>
                ) : null}
              </div>

              <ErrorBanner message={apiError} />

              <button
                className="btn-primary w-full"
                disabled={isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting
                  ? "Submitting request..."
                  : "Submit Booking Request"}
              </button>
              <p className="text-center text-xs text-slate-500">
                Once the PSW confirms this time, you'll see a Pay Now option in
                your dashboard.
              </p>
            </div>
          ) : null}

          {/* Navigation */}
          <div className="mt-6 flex items-center gap-3">
            <button
              className="btn-outline btn-sm"
              disabled={step === 1}
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              type="button"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                className="btn-primary btn-sm"
                disabled={
                  (step === 1 && !canGoNextFromStep1) ||
                  (step === 2 && !canGoNextFromStep2)
                }
                onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                type="button"
              >
                Continue
              </button>
            ) : null}
          </div>
        </section>
      </PageTransition>
    </main>
  );
};

export default BookingFlowPage;
