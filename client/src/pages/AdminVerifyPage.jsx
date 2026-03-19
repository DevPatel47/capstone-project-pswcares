import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
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
      setError(
        requestError?.response?.data?.message ||
          "Failed to load verification queue.",
      );
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

      setItems((previous) =>
        previous.filter((item) => item.profile?._id !== profileId),
      );
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Action failed.");
    }
  };

  return (
    <AdminShell
      title="Verification Queue"
      subtitle="Approve or reject pending PSW verification submissions."
    >
      <div className="mb-4 flex justify-end">
        <button
          className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || refreshingLinks}
          onClick={handleRefreshLinks}
          type="button"
        >
          {refreshingLinks
            ? "Refreshing links..."
            : "Refresh certificate links"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading queue...</p>
      ) : null}
      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.profile?._id}
            className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {item.profile?.userId?.name}
            </h3>
            <p className="text-sm text-slate-600">
              {item.profile?.userId?.email}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Experience: {item.profile?.experience ?? 0} years
            </p>
            <p className="text-sm text-slate-600">
              Hourly Rate: ${item.profile?.hourlyRate ?? 0}
            </p>
            <p className="text-sm text-slate-600">
              Certificates: {item.certificates?.length ?? 0}
            </p>

            {item.certificates?.length ? (
              <div className="mt-3 rounded-lg border border-cyan-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Certificate Documents
                </p>
                <ul className="mt-2 space-y-2">
                  {item.certificates.map((certificate, index) => {
                    const fileName =
                      certificate.originalFileName ||
                      `Certificate ${index + 1}`;

                    if (!certificate.fileUrl) {
                      return (
                        <li
                          key={
                            certificate._id || `${item.profile?._id}-${index}`
                          }
                          className="text-sm text-amber-700"
                        >
                          {fileName} (link unavailable)
                        </li>
                      );
                    }

                    return (
                      <li
                        key={certificate._id || `${item.profile?._id}-${index}`}
                      >
                        <a
                          className="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
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
              <p className="mt-2 text-sm text-amber-700">
                No certificates uploaded yet.
              </p>
            )}

            <textarea
              className="mt-3 w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
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
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                type="button"
                onClick={() => handleDecision(item.profile?._id, "approved")}
              >
                Approve
              </button>
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                type="button"
                onClick={() => handleDecision(item.profile?._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <p className="text-sm text-slate-500">No pending verifications.</p>
      ) : null}
    </AdminShell>
  );
};

export default AdminVerifyPage;
