import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import { getAdminAnalytics } from "../services/adminApi";

const STAT_ICONS = [
  "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
];

const GRADIENTS = [
  "from-brand-400 to-brand-600",
  "from-emerald-400 to-emerald-600",
  "from-accent-400 to-accent-600",
  "from-amber-400 to-amber-600",
  "from-pink-400 to-rose-500",
  "from-red-400 to-red-600",
];

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminAnalytics();
        setAnalytics(data);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const cards = analytics
    ? [
        { label: "Total Users", value: analytics.users?.total ?? 0 },
        { label: "Pending Verifications", value: analytics.verification?.pending ?? 0 },
        { label: "Completed Appointments", value: analytics.appointments?.completed ?? 0 },
        { label: "Successful Payments", value: analytics.payments?.succeeded ?? 0 },
        { label: "Total Reviews", value: analytics.reviews?.total ?? 0 },
        { label: "Open Disputes", value: analytics.disputes?.open ?? 0 },
      ]
    : [];

  return (
    <AdminShell
      title="Admin Overview"
      subtitle="Monitor core metrics and platform health at a glance."
    >
      {loading ? <LoadingState label="Loading analytics..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <article
              key={card.label}
              className="rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5 transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${GRADIENTS[i]} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={STAT_ICONS[i]} />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </article>
          ))}
        </div>
      ) : null}
    </AdminShell>
  );
};

export default AdminOverviewPage;
