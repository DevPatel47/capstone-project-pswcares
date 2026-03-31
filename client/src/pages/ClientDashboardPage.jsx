import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardShell from "../components/DashboardShell";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/LoadingState";
import BookingCard from "../components/client-dashboard/BookingCard";
import MessagePreview from "../components/client-dashboard/MessagePreview";
import NotificationItem from "../components/client-dashboard/NotificationItem";
import PSWCard from "../components/client-dashboard/PSWCard";
import SearchBar from "../components/client-dashboard/SearchBar";
import {
  getMyAppointmentsRequest,
  rescheduleBookingRequest,
  updateBookingStatusRequest,
} from "../services/appointmentApi";
import { createCheckoutSessionRequest } from "../services/paymentApi";
import { getMessagesByAppointmentRequest } from "../services/chatApi";
import { getAuthSession } from "../services/authStorage";
import { searchPSWsRequest } from "../services/pswProfileApi";
import { useToast } from "../context/ToastContext";

const fadeUp = (index = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: index * 0.04 },
});

const formatDateTime = (date, time) => {
  if (!date) return "";
  const formattedDate = new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(date));
  return `${formattedDate}${time ? ` • ${time}` : ""}`;
};

const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
};

const buildNotifications = (appointments) => {
  const items = [];
  const formatStamp = (value) =>
    new Intl.DateTimeFormat("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  for (const booking of appointments) {
    const updatedAt = booking.updatedAt || booking.appointmentDate;
    const slot = formatDateTime(
      booking.appointmentDate,
      booking.appointmentTime,
    );

    if (booking.status === "pending") {
      items.push({
        id: `pending-${booking._id}`,
        kind: "booking",
        text: `Booking request sent to ${booking.pswId?.name || "PSW"} for ${slot}. Awaiting confirmation.`,
        tone: "bg-amber-500",
        time: formatStamp(booking.createdAt || updatedAt),
        ts: new Date(booking.createdAt || updatedAt).getTime(),
      });
    }

    if (booking.status === "confirmed") {
      items.push({
        id: `confirmed-${booking._id}`,
        kind: "booking",
        text: `Booking confirmed with ${booking.pswId?.name || "PSW"} for ${slot}.`,
        tone: "bg-emerald-500",
        time: formatStamp(updatedAt),
        ts: new Date(updatedAt).getTime(),
      });
    }

    if (booking.status === "cancelled") {
      items.push({
        id: `cancelled-${booking._id}`,
        kind: "booking",
        text: `Appointment with ${booking.pswId?.name || "PSW"} for ${slot} was cancelled.`,
        tone: "bg-rose-500",
        time: formatStamp(updatedAt),
        ts: new Date(updatedAt).getTime(),
      });
    }

    if (booking.status === "completed") {
      items.push({
        id: `completed-${booking._id}`,
        kind: "booking",
        text: `Care session with ${booking.pswId?.name || "PSW"} for ${slot} is completed.`,
        tone: "bg-blue-500",
        time: formatStamp(updatedAt),
        ts: new Date(updatedAt).getTime(),
      });
    }

    if (booking.rescheduledAt) {
      items.push({
        id: `rescheduled-${booking._id}`,
        kind: "reschedule",
        text: `Appointment with ${booking.pswId?.name || "PSW"} was rescheduled (${slot}).`,
        tone: "bg-violet-500",
        time: formatStamp(booking.rescheduledAt),
        ts: new Date(booking.rescheduledAt).getTime(),
      });
    }

    if (booking.paymentId?.status === "succeeded") {
      items.push({
        id: `payment-${booking._id}`,
        kind: "payment",
        text: `Payment completed for ${booking.pswId?.name || "PSW"} (${slot}).`,
        tone: "bg-brand-500",
        time: formatStamp(booking.paymentId?.paidAt || updatedAt),
        ts: new Date(booking.paymentId?.paidAt || updatedAt).getTime(),
      });
    }

    if (booking.paymentId?.status === "cancelled") {
      items.push({
        id: `payment-cancelled-${booking._id}`,
        kind: "payment",
        text: `Payment was cancelled for appointment with ${booking.pswId?.name || "PSW"} (${slot}).`,
        tone: "bg-orange-500",
        time: formatStamp(booking.paymentId?.cancelledAt || updatedAt),
        ts: new Date(booking.paymentId?.cancelledAt || updatedAt).getTime(),
      });
    }
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, 6);
};

const toDateInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getAppointmentDateTime = (appointmentDate, appointmentTime) => {
  const baseDate = new Date(appointmentDate);

  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const [hours, minutes] = String(appointmentTime || "00:00")
    .split(":")
    .map((value) => Number(value));

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return baseDate;
  }

  baseDate.setHours(hours, minutes, 0, 0);
  return baseDate;
};

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const session = getAuthSession();
  const clientName = session?.user?.name || "there";

  const [bookings, setBookings] = useState([]);
  const [recommendedPSWs, setRecommendedPSWs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchService, setSearchService] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "09:00",
    duration: 60,
  });
  const [rescheduleError, setRescheduleError] = useState("");
  const [flashMessage, setFlashMessage] = useState("");

  const runQuickFilter = async (service) => {
    setSearchService(service);
    setIsSearching(true);
    try {
      await loadRecommendations({ service, location: searchQuery });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to load recommendations.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const loadRecommendations = useCallback(async (params = {}) => {
    const data = await searchPSWsRequest({
      limit: 4,
      ...params,
    });
    setRecommendedPSWs(data.items || []);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const bookingsData = await getMyAppointmentsRequest();
      const bookingItems = bookingsData.items || [];
      setBookings(bookingItems);

      await loadRecommendations();

      const messageCandidates = bookingItems
        .filter((item) => ["confirmed", "completed"].includes(item.status))
        .slice(0, 4);

      const messageResults = await Promise.allSettled(
        messageCandidates.map((item) =>
          getMessagesByAppointmentRequest(item._id),
        ),
      );

      const previewItems = messageResults
        .map((result, index) => {
          if (result.status !== "fulfilled") return null;
          const list = result.value.items || [];
          if (list.length === 0) return null;
          const latest = list[list.length - 1];
          return {
            appointmentId: String(messageCandidates[index]._id),
            name: messageCandidates[index].pswId?.name || "PSW",
            preview: latest.content,
            time: new Intl.DateTimeFormat("en-CA", {
              month: "short",
              day: "numeric",
            }).format(new Date(latest.createdAt)),
          };
        })
        .filter(Boolean)
        .slice(0, 4);

      setMessages(previewItems);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadRecommendations]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!location.state?.bookingSubmitted) {
      return;
    }

    setFlashMessage(
      location.state?.message ||
        "Booking request submitted. Wait for PSW confirmation to pay.",
    );

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {},
    });
  }, [location.pathname, location.search, location.state, navigate]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(
        (item) =>
          ["pending", "confirmed"].includes(item.status) &&
          (() => {
            const bookingDateTime = getAppointmentDateTime(
              item.appointmentDate,
              item.appointmentTime,
            );
            if (!bookingDateTime) return false;
            return bookingDateTime >= now;
          })(),
      )
      .sort((a, b) => {
        const left = getAppointmentDateTime(
          a.appointmentDate,
          a.appointmentTime,
        );
        const right = getAppointmentDateTime(
          b.appointmentDate,
          b.appointmentTime,
        );
        return (left?.getTime() || 0) - (right?.getTime() || 0);
      })
      .slice(0, 5);
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return bookings
      .filter((item) => ["completed", "cancelled"].includes(item.status))
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.appointmentDate) -
          new Date(a.updatedAt || a.appointmentDate),
      )
      .slice(0, 6);
  }, [bookings]);

  const notifications = useMemo(() => buildNotifications(bookings), [bookings]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setIsSearching(true);
    try {
      await loadRecommendations({
        location: searchQuery,
        service: searchService,
      });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to load recommendations.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancel = async (booking) => {
    setBusyBookingId(String(booking._id));
    try {
      await updateBookingStatusRequest(booking._id, "cancelled");
      toast.success("Booking cancelled.");
      await loadDashboard();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to cancel booking.",
      );
    } finally {
      setBusyBookingId("");
    }
  };

  const handleReschedule = async (booking) => {
    setRescheduleError("");
    setRescheduleTarget(booking);
    setRescheduleForm({
      date: toDateInputValue(booking.appointmentDate),
      time: booking.appointmentTime || "09:00",
      duration: Number(booking.durationMinutes || 60),
    });
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget) return;

    if (!rescheduleForm.date || !rescheduleForm.time) {
      setRescheduleError("Date and time are required.");
      return;
    }

    if (!Number.isFinite(Number(rescheduleForm.duration))) {
      setRescheduleError("Duration must be a number.");
      return;
    }

    setBusyBookingId(String(rescheduleTarget._id));
    try {
      await rescheduleBookingRequest(rescheduleTarget._id, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        duration: Number(rescheduleForm.duration),
        reason: "Rescheduled from client dashboard",
      });
      toast.success("Booking rescheduled.");
      setRescheduleTarget(null);
      await loadDashboard();
    } catch (requestError) {
      const msg =
        requestError.response?.data?.message || "Unable to reschedule booking.";
      setRescheduleError(msg);
      toast.error(msg);
    } finally {
      setBusyBookingId("");
    }
  };

  const handlePay = async (booking) => {
    setBusyBookingId(String(booking._id));
    try {
      const checkout = await createCheckoutSessionRequest({
        appointmentId: booking._id,
      });

      if (checkout?.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }

      toast.error("Checkout is not available right now.");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to start payment for this appointment.",
      );
    } finally {
      setBusyBookingId("");
    }
  };

  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Find care fast, manage upcoming bookings, and stay on top of every update."
    >
      {loading ? <LoadingState label="Loading dashboard..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {flashMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center justify-between gap-3">
            <span>{flashMessage}</span>
            <button
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              onClick={() => setFlashMessage("")}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-7">
          <motion.section
            {...fadeUp(0)}
            className="overflow-hidden rounded-2xl border border-brand-100/70 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 p-6 text-white"
          >
            <p className="text-sm font-medium text-brand-50">
              {getGreeting(clientName)}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
              What should you do next?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-brand-50/95">
              Start with discovery or jump straight into your active bookings.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                to="/client/psw-search"
              >
                Find a PSW
              </Link>
              <button
                className="rounded-xl border border-white/50 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => navigate("/client/chat")}
                type="button"
              >
                View Bookings
              </button>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <motion.section {...fadeUp(1)}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Upcoming Appointments
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    Next 3-5 bookings
                  </span>
                </div>
                {upcomingBookings.length === 0 ? (
                  <EmptyState
                    title="No upcoming bookings"
                    description="Find a PSW to schedule your next care visit."
                  />
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div
                        className={
                          busyBookingId === String(booking._id)
                            ? "opacity-70"
                            : ""
                        }
                        key={booking._id}
                      >
                        <BookingCard
                          booking={booking}
                          canPay={
                            booking.status === "confirmed" &&
                            booking.paymentId?.status !== "succeeded"
                          }
                          canCancel={
                            booking.paymentId?.status !== "succeeded" &&
                            ["pending", "confirmed"].includes(booking.status)
                          }
                          onCancel={handleCancel}
                          onPay={handlePay}
                          onReschedule={handleReschedule}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section {...fadeUp(2)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Quick Search
                  </h3>
                  <Link
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    to="/client/psw-search"
                  >
                    Full search
                  </Link>
                </div>

                <SearchBar
                  isLoading={isSearching}
                  onQueryChange={setSearchQuery}
                  onServiceChange={setSearchService}
                  onSubmit={handleSearch}
                  query={searchQuery}
                  service={searchService}
                />

                <div className="flex flex-wrap gap-2">
                  {[
                    "Elder care",
                    "Disability support",
                    "Post-surgery care",
                  ].map((service) => (
                    <button
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${searchService === service ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 bg-white text-brand-700 hover:bg-brand-50"}`}
                      key={service}
                      onClick={() => runQuickFilter(service)}
                      type="button"
                    >
                      {service}
                    </button>
                  ))}
                </div>

                {recommendedPSWs.length === 0 ? (
                  <EmptyState
                    title="No recommendations yet"
                    description="Try a broader location or service search."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {recommendedPSWs.map((profile) => (
                      <PSWCard key={profile._id} profile={profile} />
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section {...fadeUp(3)}>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                  <EmptyState
                    title="No recent activity"
                    description="Completed and cancelled bookings appear here."
                  />
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-brand-100/60 bg-white">
                    {recentActivity.map((item) => (
                      <div
                        className="flex flex-col gap-1 border-b border-brand-100/50 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                        key={item._id}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.pswId?.name || "PSW"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(
                              item.appointmentDate,
                              item.appointmentTime,
                            )}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500">
                          <p>
                            Status:{" "}
                            <span className="font-semibold capitalize text-slate-700">
                              {item.status}
                            </span>
                          </p>
                          <p>
                            Payment:{" "}
                            <span className="font-semibold capitalize text-slate-700">
                              {item.paymentId?.status || "unpaid"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            <div className="space-y-6">
              <motion.section {...fadeUp(2)} className="app-card">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Messages Preview
                </h3>
                {messages.length === 0 ? (
                  <EmptyState
                    title="No conversations yet"
                    description="Your latest chats with PSWs appear here."
                  />
                ) : (
                  <div className="space-y-2">
                    {messages.map((item) => (
                      <MessagePreview item={item} key={item.appointmentId} />
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section {...fadeUp(3)} className="app-card">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Notifications
                </h3>
                {notifications.length === 0 ? (
                  <EmptyState
                    title="No new notifications"
                    description="Booking and payment updates show up here."
                  />
                ) : (
                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <NotificationItem item={item} key={item.id} />
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section {...fadeUp(4)} className="app-card">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    className="btn-primary w-full text-center"
                    to="/client/psw-search"
                  >
                    Book new service
                  </Link>
                  <Link
                    className="btn-outline w-full text-center"
                    to="/client/chat"
                  >
                    View history
                  </Link>
                  <Link
                    className="btn-outline w-full text-center"
                    to="/contact"
                  >
                    Update profile
                  </Link>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      ) : null}

      {rescheduleTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-100/60 bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">
              Reschedule Appointment
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {rescheduleTarget.pswId?.name || "PSW"}
            </p>

            <div className="mt-4 grid gap-3">
              <div>
                <label className="app-label" htmlFor="reschedule-date">
                  Date
                </label>
                <input
                  className="app-input"
                  id="reschedule-date"
                  min={toDateInputValue(new Date())}
                  onChange={(event) =>
                    setRescheduleForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  type="date"
                  value={rescheduleForm.date}
                />
              </div>

              <div>
                <label className="app-label" htmlFor="reschedule-time">
                  Time
                </label>
                <input
                  className="app-input"
                  id="reschedule-time"
                  onChange={(event) =>
                    setRescheduleForm((prev) => ({
                      ...prev,
                      time: event.target.value,
                    }))
                  }
                  type="time"
                  value={rescheduleForm.time}
                />
              </div>

              <div>
                <label className="app-label" htmlFor="reschedule-duration">
                  Duration (minutes)
                </label>
                <select
                  className="app-select"
                  id="reschedule-duration"
                  onChange={(event) =>
                    setRescheduleForm((prev) => ({
                      ...prev,
                      duration: Number(event.target.value),
                    }))
                  }
                  value={rescheduleForm.duration}
                >
                  {[30, 60, 90, 120, 180].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {rescheduleError ? (
              <div className="mt-3">
                <ErrorBanner compact message={rescheduleError} />
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="btn-outline btn-sm"
                onClick={() => setRescheduleTarget(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="btn-primary btn-sm"
                disabled={busyBookingId === String(rescheduleTarget._id)}
                onClick={submitReschedule}
                type="button"
              >
                {busyBookingId === String(rescheduleTarget._id)
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
};

export default ClientDashboardPage;
