import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getAdminContacts, updateAdminContactStatus } from "../services/adminApi";

const STATUS_BADGE = {
  new: "info",
  read: "neutral",
  archived: "warning",
};

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminContacts(filter ? { status: filter } : {});
      setContacts(data.items);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [filter]);

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateAdminContactStatus(contactId, newStatus);
      setContacts((prev) =>
        prev.map((c) => (c._id === contactId ? { ...c, status: newStatus } : c)),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminShell
      title="Contact Submissions"
      subtitle="View and manage messages from the contact form."
    >
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {["", "new", "read", "archived"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              filter === f
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading submissions..." />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && contacts.length === 0 && (
        <EmptyState title="No submissions found" description="Try changing the filter or check back later." />
      )}

      {!loading && !error && contacts.length > 0 && (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <article
              key={contact._id}
              className="rounded-xl border border-brand-100/60 overflow-hidden bg-white"
            >
              {/* Header row */}
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === contact._id ? null : contact._id)}
                className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-brand-50/30 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={STATUS_BADGE[contact.status]}>{contact.status}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(contact.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-slate-900 truncate">{contact.subject}</p>
                  <p className="text-sm text-slate-500 truncate">
                    From: {contact.name} &lt;{contact.email}&gt;
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedId === contact._id ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded details */}
              {expandedId === contact._id && (
                <div className="border-t border-brand-100/60 p-5 bg-brand-50/10">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</p>
                      <p className="text-slate-900">{contact.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-brand-600 hover:text-brand-700 font-medium">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Message</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white rounded-xl p-4 border border-brand-100/60">
                      {contact.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 mr-2">Set status:</span>
                    {["new", "read", "archived"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={contact.status === s}
                        onClick={() => handleStatusChange(contact._id, s)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          contact.status === s
                            ? "bg-brand-600 text-white cursor-default"
                            : "bg-white border border-brand-200 text-brand-700 hover:bg-brand-50"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminContactsPage;
