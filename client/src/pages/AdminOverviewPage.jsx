import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { getAdminAnalytics } from "../services/adminApi";

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
        setError(
          requestError?.response?.data?.message || "Failed to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const cards = analytics
    ? [
        { label: "Total Users", value: analytics.users?.total ?? 0 },
        {
          label: "Pending Verifications",
          value: analytics.verification?.pending ?? 0,
        },
        {
          label: "Completed Appointments",
          value: analytics.appointments?.completed ?? 0,
        },
        {
          label: "Successful Payments",
          value: analytics.payments?.succeeded ?? 0,
        },
        { label: "Total Reviews", value: analytics.reviews?.total ?? 0 },
        { label: "Open Disputes", value: analytics.disputes?.open ?? 0 },
      ]
    : [];

  return (
    <AdminShell
      title="Admin Overview"
      subtitle="Monitor core metrics and platform health at a glance."
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-800">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {card.value}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </AdminShell>
  );
};

export default AdminOverviewPage;
