import { useEffect, useRef, useState } from "react";
import AdminShell from "../components/AdminShell";
import {
  getAdminDisputeDetails,
  getAdminDisputes,
  updateAdminDispute,
} from "../services/adminApi";

const STATUS_OPTIONS = ["all", "open", "in_review", "resolved"];

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

      if (requestId !== listRequestIdRef.current) {
        return;
      }

      const nextItems = data.items || [];
      setItems(nextItems);

      if (nextItems.length === 0) {
        setSelectedDisputeId("");
        setSelectedDispute(null);
        return;
      }

      const preferredSelection = preferredId || selectedDisputeId;
      const hasPreferred = nextItems.some(
        (item) => item._id === preferredSelection,
      );

      setSelectedDisputeId(
        hasPreferred ? preferredSelection : nextItems[0]._id,
      );
    } catch (requestError) {
      setListError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load disputes.",
      );
    } finally {
      if (requestId === listRequestIdRef.current) {
        setLoading(false);
      }
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
        if (requestId !== detailRequestIdRef.current) {
          return;
        }
        setSelectedDispute(data.dispute || null);
      } catch (requestError) {
        setDetailError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Failed to load dispute details.",
        );
      } finally {
        if (requestId === detailRequestIdRef.current) {
          setLoadingDetails(false);
        }
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
      setActionError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to update dispute.",
      );
    }
  };

  return (
    <AdminShell
      title="Dispute Handling"
      subtitle="Track and resolve active disputes across appointments."
    >
      <div className="mb-4 flex items-center gap-3">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="statusFilter"
        >
          Status
        </label>
        <select
          id="statusFilter"
          className="rounded-lg border border-cyan-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All" : status.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading disputes...</p>
      ) : null}
      {listError ? (
        <p className="mb-2 text-sm text-rose-600">{listError}</p>
      ) : null}
      {detailError ? (
        <p className="mb-2 text-sm text-rose-600">{detailError}</p>
      ) : null}
      {actionError ? (
        <p className="mb-3 text-sm text-rose-600">{actionError}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item._id}
              className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                selectedDisputeId === item._id
                  ? "border-cyan-300 bg-cyan-50"
                  : "border-cyan-100 bg-white hover:bg-cyan-50"
              }`}
              onClick={() => setSelectedDisputeId(item._id)}
              type="button"
            >
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs uppercase text-cyan-800">
                {item.status}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
          {loadingDetails ? (
            <p className="text-sm text-slate-500">Loading details...</p>
          ) : null}

          {!loadingDetails && !selectedDispute ? (
            <p className="text-sm text-slate-500">
              Select a dispute to view details.
            </p>
          ) : null}

          {!loadingDetails && selectedDispute ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedDispute.title}
                </h3>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase text-cyan-800">
                  {selectedDispute.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                {selectedDispute.description}
              </p>

              <p className="mt-3 text-xs text-slate-600">
                Client: {selectedDispute.clientId?.name || "N/A"} | PSW:{" "}
                {selectedDispute.pswId?.name || "N/A"}
              </p>

              <textarea
                className="mt-3 w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                placeholder="Resolution note"
                value={
                  noteByDispute[selectedDispute._id] ||
                  selectedDispute.resolutionNote ||
                  ""
                }
                onChange={(event) =>
                  setNoteByDispute((previous) => ({
                    ...previous,
                    [selectedDispute._id]: event.target.value,
                  }))
                }
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedDispute._id, "in_review")
                  }
                >
                  Mark In Review
                </button>
                <button
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedDispute._id, "resolved")
                  }
                >
                  Resolve
                </button>
                <button
                  className="rounded-lg border border-cyan-300 bg-white px-4 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-50"
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedDispute._id, "open")
                  }
                >
                  Reopen
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!loading && items.length === 0 ? (
        <p className="text-sm text-slate-500">No disputes found.</p>
      ) : null}
    </AdminShell>
  );
};

export default AdminDisputesPage;
