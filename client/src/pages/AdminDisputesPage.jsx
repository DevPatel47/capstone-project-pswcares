import { useEffect, useRef, useState } from "react";
import AdminShell from "../components/AdminShell";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import {
  getAdminDisputeDetails,
  getAdminDisputes,
  updateAdminDispute,
} from "../services/adminApi";

const STATUS_OPTIONS = ["all", "open", "in_review", "resolved"];

const statusBadge = (status) => {
  const map = { open: "danger", in_review: "warning", resolved: "success" };
  return map[status] || "neutral";
};

const AdminDisputesPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [selectedDisputeId, setSelectedDisputeId] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [noteByDispute, setNoteByDispute] = useState({});
  const listRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const loadDisputes = async ({ preferredId } = {}) => {
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;
    setLoading(true);
    setListError("");
    setActionError("");

    try {
      const data = await getAdminDisputes({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (requestId !== listRequestIdRef.current) return;
      const nextItems = data.items || [];
      setItems(nextItems);

      if (nextItems.length === 0) {
        setSelectedDisputeId("");
        setSelectedDispute(null);
        return;
      }
      const preferredSelection = preferredId || selectedDisputeId;
      const hasPreferred = nextItems.some((item) => item._id === preferredSelection);
      setSelectedDisputeId(hasPreferred ? preferredSelection : nextItems[0]._id);
    } catch (requestError) {
      setListError(requestError?.response?.data?.message || requestError?.message || "Failed to load disputes.");
    } finally {
      if (requestId === listRequestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  useEffect(() => {
    const loadDetails = async () => {
      const requestId = detailRequestIdRef.current + 1;
      detailRequestIdRef.current = requestId;

      if (!selectedDisputeId) {
        setSelectedDispute(null);
        return;
      }
      setLoadingDetails(true);
      setDetailError("");
      try {
        const data = await getAdminDisputeDetails(selectedDisputeId);
        if (requestId !== detailRequestIdRef.current) return;
        setSelectedDispute(data.dispute || null);
      } catch (requestError) {
        setDetailError(requestError?.response?.data?.message || requestError?.message || "Failed to load dispute details.");
      } finally {
        if (requestId === detailRequestIdRef.current) setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [selectedDisputeId]);

  const handleStatusChange = async (disputeId, status) => {
    setActionError("");
    try {
      await updateAdminDispute(disputeId, {
        status,
        resolutionNote: noteByDispute[disputeId] || "",
      });
      await loadDisputes({ preferredId: disputeId });
    } catch (requestError) {
      setActionError(requestError?.response?.data?.message || requestError?.message || "Failed to update dispute.");
    }
  };

  return (
    <AdminShell
      title="Dispute Handling"
      subtitle="Track and resolve active disputes across appointments."
    >
      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              statusFilter === s
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? <LoadingState label="Loading disputes..." /> : null}
      {listError ? <ErrorBanner message={listError} /> : null}
      {detailError ? <ErrorBanner message={detailError} /> : null}
      {actionError ? <ErrorBanner message={actionError} /> : null}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* List */}
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item._id}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                selectedDisputeId === item._id
                  ? "border-brand-300 bg-brand-50 shadow-sm"
                  : "border-brand-100/60 bg-white hover:bg-brand-50/50"
              }`}
              onClick={() => setSelectedDisputeId(item._id)}
              type="button"
            >
              <p className="font-semibold text-slate-900">{item.title}</p>
              <div className="mt-1">
                <Badge variant={statusBadge(item.status)}>{item.status.replace("_", " ")}</Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5">
          {loadingDetails ? <LoadingState label="Loading details..." /> : null}

          {!loadingDetails && !selectedDispute ? (
            <EmptyState title="Select a dispute" description="Click on a dispute to view its details." />
          ) : null}

          {!loadingDetails && selectedDispute ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">{selectedDispute.title}</h3>
                <Badge variant={statusBadge(selectedDispute.status)}>
                  {selectedDispute.status.replace("_", " ")}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{selectedDispute.description}</p>

              <p className="mt-3 text-xs text-slate-500">
                Client: <span className="font-medium text-slate-700">{selectedDispute.clientId?.name || "N/A"}</span> · PSW: <span className="font-medium text-slate-700">{selectedDispute.pswId?.name || "N/A"}</span>
              </p>

              <textarea
                className="app-input mt-4 resize-none"
                rows="2"
                placeholder="Resolution note"
                value={noteByDispute[selectedDispute._id] || selectedDispute.resolutionNote || ""}
                onChange={(event) =>
                  setNoteByDispute((previous) => ({
                    ...previous,
                    [selectedDispute._id]: event.target.value,
                  }))
                }
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="btn-outline btn-sm !border-amber-300 !text-amber-700 hover:!bg-amber-50"
                  type="button"
                  onClick={() => handleStatusChange(selectedDispute._id, "in_review")}
                >
                  Mark In Review
                </button>
                <button
                  className="btn-primary btn-sm !bg-emerald-600 hover:!bg-emerald-700"
                  type="button"
                  onClick={() => handleStatusChange(selectedDispute._id, "resolved")}
                >
                  Resolve
                </button>
                <button
                  className="btn-outline btn-sm"
                  type="button"
                  onClick={() => handleStatusChange(selectedDispute._id, "open")}
                >
                  Reopen
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!loading && items.length === 0 ? (
        <EmptyState title="No disputes found" description="Try changing the status filter." />
      ) : null}
    </AdminShell>
  );
};

export default AdminDisputesPage;
