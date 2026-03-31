import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardShell from "../components/DashboardShell";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import { useToast } from "../context/ToastContext";
import {
  getMyAppointmentsRequest,
  updateBookingStatusRequest,
} from "../services/appointmentApi";
import { getMyPSWProfileRequest } from "../services/pswProfileApi";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isFuture = (dateStr) =>
  new Date(dateStr) >= new Date(new Date().toDateString());

const fmtDate = (d) =>
  new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(
    new Date(d),
  );

const fmtCurrency = (v) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    v,
  );

const DAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DAY_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const getNextAvailabilitySlot = (availability = []) => {
  if (!Array.isArray(availability) || availability.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset += 1) {
    const day = DAY_ORDER[(currentDayIndex + offset) % 7];
    const slot = availability.find((item) => item.dayOfWeek === day);
    if (!slot) continue;

    const [startHour, startMinute] = String(slot.startTime || "")
      .split(":")
      .map(Number);
    const startMinutes = startHour * 60 + startMinute;

    if (offset > 0 || startMinutes >= currentMinutes) {
      return slot;
    }
  }

  return availability[0] || null;
};

const getServiceLabel = (notes) => {
  if (!notes) return "General care";
  const first = notes.split("|")[0].trim();
  return first || "General care";
};

const STATUS_BADGE = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

/* ------------------------------------------------------------------ */
/*  Stat Card                                                         */
/* ------------------------------------------------------------------ */

const StatCard = ({ icon, value, label, gradient, index }) => (
  <motion.div
    {...fadeUp(index)}
    className="group rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
  >
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-brand-600/10`}
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Appointment Card                                                  */
/* ------------------------------------------------------------------ */

const AppointmentCard = ({ apt, onStatusChange, busy }) => {
  const clientName = apt.clientId?.name || "Client";
  const service = getServiceLabel(apt.notes);
  const canComplete = apt.status === "confirmed";

  return (
    <motion.article
      {...fadeUp()}
      className="rounded-xl border border-brand-100/60 bg-white p-4 transition-all duration-200 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <Avatar name={clientName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {clientName}
            </h3>
            <Badge variant={STATUS_BADGE[apt.status]}>{apt.status}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{service}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              {fmtDate(apt.appointmentDate)}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {apt.appointmentTime} · {apt.durationMinutes}min
            </span>
          </div>
        </div>
      </div>
      {canComplete && (
        <div className="mt-3 flex justify-end">
          <button
            className="btn-primary btn-sm !bg-emerald-600 hover:!bg-emerald-700 !text-xs"
            disabled={busy}
            onClick={() => onStatusChange(apt._id, "completed")}
            type="button"
          >
            ✓ Mark Complete
          </button>
        </div>
      )}
    </motion.article>
  );
};

/* ------------------------------------------------------------------ */
/*  Request Card                                                      */
/* ------------------------------------------------------------------ */

const RequestCard = ({ apt, onStatusChange, busy }) => {
  const clientName = apt.clientId?.name || "Client";
  const service = getServiceLabel(apt.notes);

  return (
    <motion.article
      {...fadeUp()}
      className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar name={clientName} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{clientName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{service}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{fmtDate(apt.appointmentDate)}</span>
            <span>{apt.appointmentTime}</span>
            <span>{apt.durationMinutes}min</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          className="btn-outline btn-sm !border-red-200 !text-red-600 hover:!bg-red-50 !text-xs"
          disabled={busy}
          onClick={() => onStatusChange(apt._id, "cancelled")}
          type="button"
        >
          Decline
        </button>
        <button
          className="btn-primary btn-sm !text-xs"
          disabled={busy}
          onClick={() => onStatusChange(apt._id, "confirmed")}
          type="button"
        >
          Accept
        </button>
      </div>
    </motion.article>
  );
};

/* ------------------------------------------------------------------ */
/*  Message Item                                                      */
/* ------------------------------------------------------------------ */

const MessageItem = ({ apt }) => {
  const peerName = apt.clientId?.name || "Client";
  const role = "psw";

  return (
    <Link
      to={`/${role}/chat?appointmentId=${apt._id}`}
      className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-brand-50"
    >
      <Avatar name={peerName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {peerName}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {fmtDate(apt.appointmentDate)} · {apt.appointmentTime}
        </p>
      </div>
      <svg
        className="w-4 h-4 text-slate-300 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  );
};

/* ------------------------------------------------------------------ */
/*  Notification Item                                                 */
/* ------------------------------------------------------------------ */

const buildNotifications = (appointments) => {
  const notifs = [];
  const formatStamp = (value) =>
    new Intl.DateTimeFormat("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  for (const apt of appointments) {
    const created = apt.createdAt || apt.updatedAt || apt.appointmentDate;
    const updated = apt.updatedAt || apt.appointmentDate;
    const slot = `${fmtDate(apt.appointmentDate)} • ${apt.appointmentTime}`;

    if (apt.status === "pending") {
      notifs.push({
        id: `new-${apt._id}`,
        kind: "booking",
        icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
        text: `New booking request from ${apt.clientId?.name || "client"} for ${slot}.`,
        time: formatStamp(created),
        ts: new Date(created).getTime(),
        variant: "warning",
      });
    }

    if (apt.status === "confirmed") {
      notifs.push({
        id: `confirmed-${apt._id}`,
        kind: "booking",
        icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        text: `Appointment with ${apt.clientId?.name || "client"} confirmed (${slot}).`,
        time: formatStamp(updated),
        ts: new Date(updated).getTime(),
        variant: "info",
      });
    }

    if (apt.status === "completed") {
      notifs.push({
        id: `done-${apt._id}`,
        kind: "booking",
        icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        text: `Appointment with ${apt.clientId?.name || "client"} completed (${slot}).`,
        time: formatStamp(updated),
        ts: new Date(updated).getTime(),
        variant: "success",
      });
    }

    if (apt.status === "cancelled") {
      notifs.push({
        id: `cancelled-${apt._id}`,
        kind: "booking",
        icon: "M6 18L18 6M6 6l12 12",
        text: `Appointment with ${apt.clientId?.name || "client"} was cancelled (${slot}).`,
        time: formatStamp(updated),
        ts: new Date(updated).getTime(),
        variant: "danger",
      });
    }

    if (apt.rescheduledAt) {
      notifs.push({
        id: `rescheduled-${apt._id}`,
        kind: "reschedule",
        icon: "M16.5 3.75V8.25m0 0H12m4.5 0L12.75 12m0 0V7.5m0 4.5h4.5",
        text: `${apt.clientId?.name || "Client"} requested a reschedule for ${slot}.`,
        time: formatStamp(apt.rescheduledAt),
        ts: new Date(apt.rescheduledAt).getTime(),
        variant: "info",
      });
    }

    if (apt.paymentId?.status === "succeeded") {
      const paidTime = apt.paymentId?.paidAt || updated;
      notifs.push({
        id: `payment-${apt._id}`,
        kind: "payment",
        icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75",
        text: `Payment received for ${apt.clientId?.name || "client"}'s appointment (${slot}).`,
        time: formatStamp(paidTime),
        ts: new Date(paidTime).getTime(),
        variant: "success",
      });
    }
  }

  return notifs.sort((a, b) => b.ts - a.ts).slice(0, 6);
};

const NOTIF_COLORS = {
  warning: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
  info: "bg-brand-50 text-brand-600",
  danger: "bg-rose-50 text-rose-600",
};

const NotificationItem = ({ notif }) => (
  <div className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-brand-50/40">
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-lg ${NOTIF_COLORS[notif.variant] || NOTIF_COLORS.info}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={notif.icon} />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      {notif.kind ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {notif.kind}
        </p>
      ) : null}
      <p className="text-sm text-slate-700">{notif.text}</p>
      <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Section Header                                                    */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, badge, children }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {badge != null && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                               */
/* ------------------------------------------------------------------ */

const PSWDashboardPage = () => {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  /* Load data */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aptData, profileData] = await Promise.allSettled([
        getMyAppointmentsRequest(),
        getMyPSWProfileRequest(),
      ]);
      if (aptData.status === "fulfilled")
        setAppointments(aptData.value.items || []);
      if (profileData.status === "fulfilled")
        setProfile(profileData.value.profile || null);
    } catch (e) {
      setError(e.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Status change handler */
  const handleStatusChange = async (appointmentId, status) => {
    setBusyId(appointmentId);
    try {
      await updateBookingStatusRequest(appointmentId, status);
      toast.success(`Appointment ${status}.`);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status } : a)),
      );
    } catch (e) {
      toast.error(
        e.response?.data?.message || `Failed to update to ${status}.`,
      );
    } finally {
      setBusyId(null);
    }
  };

  /* Derived data */
  const pending = useMemo(
    () => appointments.filter((a) => a.status === "pending"),
    [appointments],
  );
  const confirmed = useMemo(
    () => appointments.filter((a) => a.status === "confirmed"),
    [appointments],
  );
  const completed = useMemo(
    () => appointments.filter((a) => a.status === "completed"),
    [appointments],
  );
  const upcoming = useMemo(() => {
    return [...confirmed, ...pending]
      .filter((a) => isFuture(a.appointmentDate))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);
  }, [confirmed, pending]);

  const todayCount = useMemo(
    () =>
      appointments.filter(
        (a) =>
          isToday(a.appointmentDate) &&
          ["confirmed", "pending"].includes(a.status),
      ).length,
    [appointments],
  );

  const weeklyEarnings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return completed
      .filter((a) => {
        const payment = a.paymentId;
        if (!payment || payment.status !== "succeeded") return false;
        const paidDate = payment.paidAt
          ? new Date(payment.paidAt)
          : new Date(a.appointmentDate);
        return paidDate >= weekAgo;
      })
      .reduce((sum, a) => sum + Number(a.paymentId?.amount || 0) / 100, 0);
  }, [completed]);

  const nextAvailabilitySlot = useMemo(
    () => getNextAvailabilitySlot(profile?.availability || []),
    [profile],
  );

  const messages = useMemo(() => confirmed.slice(0, 3), [confirmed]);
  const notifications = useMemo(
    () => buildNotifications(appointments),
    [appointments],
  );

  const avgRating = profile?.averageRating
    ? Number(profile.averageRating).toFixed(1)
    : "—";

  /* Stats config */
  const stats = [
    {
      label: "Today's Appointments",
      value: todayCount,
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
      gradient: "from-brand-400 to-brand-600",
    },
    {
      label: "Pending Requests",
      value: pending.length,
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: "Weekly Earnings",
      value: fmtCurrency(weeklyEarnings),
      icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Average Rating",
      value: avgRating === "—" ? "—" : `⭐ ${avgRating}`,
      icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
      gradient: "from-pink-400 to-rose-500",
    },
  ];

  return (
    <DashboardShell
      title="PSW Dashboard"
      subtitle="Manage appointments, respond to requests, and track your progress."
    >
      {loading ? <LoadingState label="Loading dashboard..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {!loading && !error && (
        <div className="space-y-8">
          {/* ── 1. Stat Cards ───────────────────────────────────── */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </section>

          {/* ── 2. Booking Requests (high-priority) ────────────── */}
          {pending.length > 0 && (
            <motion.section {...fadeUp()}>
              <SectionHeader title="Booking Requests" badge={pending.length}>
                <Badge variant="warning">Action required</Badge>
              </SectionHeader>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((apt) => (
                  <RequestCard
                    key={apt._id}
                    apt={apt}
                    onStatusChange={handleStatusChange}
                    busy={busyId === apt._id}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* ── Main Grid (2 columns on lg) ────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* ── 3. Upcoming Appointments ──────────────────────── */}
              <motion.section {...fadeUp()}>
                <SectionHeader
                  title="Upcoming Appointments"
                  badge={upcoming.length}
                >
                  <Link
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    to="/psw/chat"
                  >
                    View all →
                  </Link>
                </SectionHeader>
                {upcoming.length === 0 ? (
                  <EmptyState
                    title="All clear"
                    description="No upcoming appointments right now."
                  />
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((apt) => (
                      <AppointmentCard
                        key={apt._id}
                        apt={apt}
                        onStatusChange={handleStatusChange}
                        busy={busyId === apt._id}
                      />
                    ))}
                  </div>
                )}
              </motion.section>

              {/* ── 6. Notifications ───────────────────────────────── */}
              <motion.section {...fadeUp()}>
                <SectionHeader title="Notifications" />
                {notifications.length === 0 ? (
                  <EmptyState
                    title="No notifications"
                    description="You're all caught up."
                  />
                ) : (
                  <div className="rounded-xl border border-brand-100/60 bg-white divide-y divide-brand-100/40">
                    {notifications.map((n) => (
                      <NotificationItem key={n.id} notif={n} />
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            {/* Right column (sidebar) */}
            <div className="space-y-6">
              {/* ── 4. Availability Snapshot ─────────────────────── */}
              <motion.section {...fadeUp()} className="app-card">
                <SectionHeader title="Availability" />
                {nextAvailabilitySlot ? (
                  <div className="rounded-xl border border-brand-100/60 bg-brand-50/20 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Next available
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {DAY_LABELS[nextAvailabilitySlot.dayOfWeek] ||
                        "Available"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {nextAvailabilitySlot.startTime} -{" "}
                      {nextAvailabilitySlot.endTime}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-3">
                    No weekly availability set
                  </p>
                )}
                <Link
                  className="btn-outline btn-sm w-full mt-4 text-center"
                  to="/psw/profile"
                  state={{ activeTab: "availability" }}
                >
                  Update Availability
                </Link>
              </motion.section>

              {/* ── 5. Messages Preview ──────────────────────────── */}
              <motion.section {...fadeUp()} className="app-card">
                <SectionHeader title="Messages">
                  <Link
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    to="/psw/chat"
                  >
                    Open chat →
                  </Link>
                </SectionHeader>
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-3">
                    No active conversations
                  </p>
                ) : (
                  <div className="divide-y divide-brand-100/40">
                    {messages.map((apt) => (
                      <MessageItem key={apt._id} apt={apt} />
                    ))}
                  </div>
                )}
              </motion.section>

              {/* ── 7. Quick Actions ──────────────────────────────── */}
              <motion.section {...fadeUp()} className="app-card">
                <SectionHeader title="Quick Actions" />
                <div className="space-y-2">
                  {[
                    {
                      label: "Edit Profile",
                      to: "/psw/profile",
                      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
                    },
                    {
                      label: "Upload Certificates",
                      to: "/psw/profile",
                      icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
                    },
                    {
                      label: "Open Messages",
                      to: "/psw/chat",
                      icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
                    },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <svg
                        className="w-5 h-5 text-brand-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={action.icon}
                        />
                      </svg>
                      {action.label}
                    </Link>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default PSWDashboardPage;
