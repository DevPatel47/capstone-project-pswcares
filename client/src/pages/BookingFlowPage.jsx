import { useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { createBookingRequest } from "../services/appointmentApi";
import { createCheckoutSessionRequest } from "../services/paymentApi";

const durationOptions = [30, 60, 90, 120, 180];

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

  for (let i = 0; i < startWeekDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }

  return cells;
};

const getMinDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

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
  const canGoNextFromStep2 =
    Boolean(form.date) && Boolean(form.time) && Number(form.duration) >= 15;

  const bookingSummary = {
    service: form.service,
    date: form.date,
    time: form.time,
    duration: Number(form.duration),
    notes: form.notes.trim(),
  };

  const estimatedTotal = useMemo(() => {
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      return null;
    }

    return (hourlyRate * Number(form.duration)) / 60;
  }, [form.duration, hourlyRate]);

  const isDateSelectable = (date) => {
    if (!date) {
      return false;
    }

    return date >= minDate;
  };

  const handleMonthShift = (delta) => {
    const next = new Date(calendarYear, calendarMonth + delta, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth());
  };

  const handleCalendarSelect = (date) => {
    if (!isDateSelectable(date)) {
      return;
    }

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

    setIsSubmitting(true);

    try {
      const booking = await createBookingRequest({
        pswId,
        date: bookingSummary.date,
        time: bookingSummary.time,
        duration: bookingSummary.duration,
        notes: [bookingSummary.service, bookingSummary.notes]
          .filter(Boolean)
          .join(" | "),
      });

      const appointmentId = booking?.appointment?._id;

      if (!appointmentId) {
        navigate("/client/dashboard", { replace: true });
        return;
      }

      try {
        const checkout = await createCheckoutSessionRequest({ appointmentId });

        if (checkout?.checkoutUrl) {
          window.location.href = checkout.checkoutUrl;
          return;
        }

        navigate("/client/dashboard", { replace: true });
      } catch (checkoutError) {
        const message =
          checkoutError.response?.data?.message ||
          "Booking submitted, but checkout is not available right now.";

        setApiError(message);
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                Booking Flow
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Book care with {pswName}
              </h1>
              <p className="mt-1 text-slate-600">
                Complete the 3-step form to submit a booking request.
              </p>
            </div>
            <Link
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
              to="/client/dashboard"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {["1. Service", "2. Date & Time", "3. Confirm"].map(
              (label, index) => {
                const active = step === index + 1;
                const completed = step > index + 1;

                return (
                  <div
                    key={label}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      active
                        ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                        : completed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {label}
                  </div>
                );
              },
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Step 1: Select service
              </h2>
              {suggestedServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedServices.map((service) => (
                    <button
                      key={service}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                        form.service === service
                          ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
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
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="service"
                >
                  Service
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="service"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      service: event.target.value,
                    }))
                  }
                  placeholder="Example: Elderly care"
                  value={form.service}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="notes"
                >
                  Booking notes (optional)
                </label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="notes"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Share specific care needs or context for this appointment."
                  value={form.notes}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Step 2: Choose date and time
              </h2>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    className="rounded-lg border border-cyan-200 px-3 py-1.5 text-sm text-cyan-800 hover:bg-cyan-50"
                    onClick={() => handleMonthShift(-1)}
                    type="button"
                  >
                    Prev
                  </button>
                  <p className="text-sm font-semibold text-slate-900">
                    {toMonthLabel(calendarYear, calendarMonth)}
                  </p>
                  <button
                    className="rounded-lg border border-cyan-200 px-3 py-1.5 text-sm text-cyan-800 hover:bg-cyan-50"
                    onClick={() => handleMonthShift(1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <span key={d}>{d}</span>
                    ),
                  )}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {calendarCells.map((date, index) => {
                    if (!date) {
                      return <span key={`empty-${index}`} className="h-9" />;
                    }

                    const disabled = !isDateSelectable(date);
                    const isSelected =
                      selectedDateObj &&
                      toISODate(selectedDateObj) === toISODate(date);

                    return (
                      <button
                        key={toISODate(date)}
                        className={`h-9 rounded-md text-sm ${
                          isSelected
                            ? "bg-cyan-600 text-white"
                            : disabled
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-white text-slate-700 hover:bg-cyan-50"
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
                  <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="time"
                  >
                    Time
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                    id="time"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, time: event.target.value }))
                    }
                    type="time"
                    value={form.time}
                  />
                </div>

                <div>
                  <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="duration"
                  >
                    Duration
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                    id="duration"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        duration: Number(event.target.value),
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
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Step 3: Confirm booking
              </h2>
              <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">PSW:</span>{" "}
                  {pswName}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Service:</span>{" "}
                  {bookingSummary.service}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Date:</span>{" "}
                  {bookingSummary.date}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Time:</span>{" "}
                  {bookingSummary.time}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">
                    Duration:
                  </span>{" "}
                  {bookingSummary.duration} minutes
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">
                    Estimated total:
                  </span>{" "}
                  {estimatedTotal !== null
                    ? new Intl.NumberFormat("en-CA", {
                        style: "currency",
                        currency: "CAD",
                      }).format(estimatedTotal)
                    : "Available after profile pricing is loaded"}
                </p>
                {bookingSummary.notes ? (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-900">Notes:</span>{" "}
                    {bookingSummary.notes}
                  </p>
                ) : null}
              </div>

              {apiError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                  {apiError}
                </p>
              ) : null}

              <button
                className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting
                  ? "Preparing checkout..."
                  : "Confirm and Continue to Payment"}
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={step === 1}
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              type="button"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
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
      </section>
    </main>
  );
};

export default BookingFlowPage;
