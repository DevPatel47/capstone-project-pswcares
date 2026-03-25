import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import {
  getAdminVerificationQueue,
  updateAdminVerification,
} from "../services/adminApi";

const AdminVerifyPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingLinks, setRefreshingLinks] = useState(false);
  const [error, setError] = useState("");
  const [noteByProfile, setNoteByProfile] = useState({});

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminVerificationQueue();
      setItems(data.items || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load verification queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleRefreshLinks = async () => {
    setRefreshingLinks(true);
    await loadQueue();
    setRefreshingLinks(false);
  };

  const handleDecision = async (profileId, status) => {
    try {
      await updateAdminVerification(profileId, {
        status,
        note: noteByProfile[profileId] || "",
      });
      setItems((previous) => previous.filter((item) => item.profile?._id !== profileId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Action failed.");
    }
  };

  return (
    <AdminShell
      title="Verification Queue"
      subtitle="Approve or reject pending PSW verification submissions."
    >
      <div className="mb-5 flex justify-end">
        <button
          className="btn-outline btn-sm"
          disabled={loading || refreshingLinks}
          onClick={handleRefreshLinks}
          type="button"
        >
          {refreshingLinks ? "Refreshing links..." : "Refresh certificate links"}
        </button>
      </div>

      {loading ? <LoadingState label="Loading queue..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.profile?._id}
            className="rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5"
          >
            <div className="flex items-start gap-4">
              <Avatar name={item.profile?.userId?.name || ""} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{item.profile?.userId?.name}</h3>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-sm text-slate-500">{item.profile?.userId?.email}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span><span className="font-semibold text-slate-900">{item.profile?.experience ?? 0}</span> yrs exp</span>
                  <span><span className="font-semibold text-slate-900">${item.profile?.hourlyRate ?? 0}</span>/hr</span>
                  <span><span className="font-semibold text-slate-900">{item.certificates?.length ?? 0}</span> certificates</span>
                </div>
              </div>
            </div>

            {item.certificates?.length ? (
              <div className="mt-4 rounded-xl border border-brand-100/60 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Certificate Documents
                </p>
                <ul className="space-y-2">
                  {item.certificates.map((certificate, index) => {
                    const fileName = certificate.originalFileName || `Certificate ${index + 1}`;
                    if (!certificate.fileUrl) {
                      return (
                        <li key={certificate._id || `${item.profile?._id}-${index}`} className="text-sm text-amber-600">
                          {fileName} (link unavailable)
                        </li>
                      );
                    }
                    return (
                      <li key={certificate._id || `${item.profile?._id}-${index}`}>
                        <a
                          className="btn-outline btn-sm inline-flex"
                          href={certificate.fileUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          View {fileName}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-amber-600">No certificates uploaded yet.</p>
            )}

            <textarea
              className="app-input mt-4 resize-none"
              rows="2"
              placeholder="Optional review note"
              value={noteByProfile[item.profile?._id] || ""}
              onChange={(event) =>
                setNoteByProfile((previous) => ({
                  ...previous,
                  [item.profile?._id]: event.target.value,
                }))
              }
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="btn-primary btn-sm !bg-emerald-600 hover:!bg-emerald-700"
                type="button"
                onClick={() => handleDecision(item.profile?._id, "approved")}
              >
                ✓ Approve
              </button>
              <button
                className="btn-danger btn-sm"
                type="button"
                onClick={() => handleDecision(item.profile?._id, "rejected")}
              >
                ✗ Reject
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <EmptyState title="Queue is clear" description="No pending verifications to review." />
      ) : null}
    </AdminShell>
  );
};

export default AdminVerifyPage;
