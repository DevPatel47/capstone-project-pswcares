import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import LoadingState from "../components/LoadingState";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageTransition from "../components/ui/PageTransition";
import { useToast } from "../context/ToastContext";
import { getMyAppointmentsRequest } from "../services/appointmentApi";
import {
  createDisputeRequest,
  getDisputeDetailsRequest,
  getMyDisputesRequest,
} from "../services/disputeApi";

const STATUS_FILTERS = ["all", "open", "in_review", "resolved"];

const statusBadge = (status) => {
  const map = { open: "danger", in_review: "warning", resolved: "success" };
  return map[status] || "neutral";
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
};

const ClientDisputesPage = () => {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [selectedDisputeId, setSelectedDisputeId] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appointmentsWarning, setAppointmentsWarning] = useState("");
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ appointmentId: "", title: "", description: "" });
  const listRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const appointmentOptions = useMemo(() => {
    return appointments.map((item) => ({
      value: item._id,
      label: `${new Date(item.appointmentDate).toLocaleDateString()} ${item.appointmentTime} - ${item.pswId?.name || "PSW"}`,
    }));
  }, [appointments]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsWarning("");
    try {
      const data = await getMyAppointmentsRequest();
      const ownAppointments = (data.items || []).filter((item) => item.clientId?._id);
      setAppointments(ownAppointments);
      if (!form.appointmentId && ownAppointments[0]?._id) setForm((prev) => ({ ...prev, appointmentId: ownAppointments[0]._id }));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || "Unable to load appointments.";
      setAppointmentsWarning(message);
      toast.error(message);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadDisputes = async ({ preferredId } = {}) => {
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;
    setLoadingList(true);
    setListError("");
    try {
      const data = await getMyDisputesRequest({ status: statusFilter === "all" ? undefined : statusFilter });
      if (requestId !== listRequestIdRef.current) return;
      const items = data.items || [];
      setDisputes(items);
      if (items.length === 0) { setSelectedDisputeId(""); setSelectedDispute(null); return; }
      const preferredSelection = preferredId || selectedDisputeId;
      const hasPreferred = items.some((item) => item._id === preferredSelection);
      setSelectedDisputeId(hasPreferred ? preferredSelection : items[0]._id);
    } catch (requestError) {
      setListError(requestError?.response?.data?.message || requestError?.message || "Failed to load disputes.");
    } finally {
      if (requestId === listRequestIdRef.current) setLoadingList(false);
    }
  };

  const loadDetails = async (disputeId) => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;
    if (!disputeId) { setSelectedDispute(null); return; }
    setLoadingDetails(true);
    setDetailError("");
    try {
      const data = await getDisputeDetailsRequest(disputeId);
      if (requestId !== detailRequestIdRef.current) return;
      setSelectedDispute(data.dispute || null);
    } catch (requestError) {
      setDetailError(requestError?.response?.data?.message || "Failed to load dispute details.");
      setSelectedDispute(null);
    } finally {
      if (requestId === detailRequestIdRef.current) setLoadingDetails(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);
  useEffect(() => { loadDisputes(); }, [statusFilter]);
  useEffect(() => { loadDetails(selectedDisputeId); }, [selectedDisputeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");
    if (!form.appointmentId || !form.title.trim() || !form.description.trim()) {
      setSubmitError("Appointment, title, and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await createDisputeRequest({ appointmentId: form.appointmentId, title: form.title.trim(), description: form.description.trim() });
      setSuccess("Dispute reported successfully.");
      toast.success("Dispute reported successfully.");
      setForm((prev) => ({ ...prev, title: "", description: "" }));
      if (data?.dispute?._id) await loadDisputes({ preferredId: data.dispute._id });
      else await loadDisputes();
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Failed to submit dispute.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-bg px-4 py-8 text-slate-900">
      <PageTransition className="mx-auto w-full max-w-6xl space-y-6">
        <header className="app-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="page-label">Client Support</p>
              <h1 className="page-title !text-2xl">Disputes</h1>
              <p className="page-subtitle text-sm">Report issues and track resolution progress.</p>
            </div>
            <Link className="btn-outline btn-sm" to="/client/dashboard">← Dashboard</Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Report form */}
          <article className="app-card">
            <h2 className="text-lg font-bold text-slate-900">Report Issue</h2>
            {loadingAppointments ? <LoadingState label="Loading appointments..." /> : null}
            {appointmentsWarning ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{appointmentsWarning}</div>
            ) : null}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <select className="app-select" value={form.appointmentId} onChange={(e) => setForm((prev) => ({ ...prev, appointmentId: e.target.value }))}>
                <option value="">Select appointment</option>
                {appointmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <input className="app-input" placeholder="Issue title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
              <textarea className="app-input min-h-28 resize-none" placeholder="Describe what happened" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <button className="btn-primary btn-sm w-full" disabled={submitting} type="submit">
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
            </form>

            {success ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}
            {submitError ? <ErrorBanner message={submitError} compact /> : null}
          </article>

          {/* Disputes list + details */}
          <article className="app-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">My Disputes</h2>
              <select className="app-select max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s.replace("_", " ")}</option>)}
              </select>
            </div>

            {listError ? <ErrorBanner message={listError} compact /> : null}
            {detailError ? <ErrorBanner message={detailError} compact /> : null}

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              {/* List */}
              <div className="space-y-2">
                {loadingList ? <LoadingState label="Loading list..." /> : null}
                {!loadingList && disputes.length === 0 ? <EmptyState title="No disputes" description="No disputes reported." /> : null}
                {disputes.map((item) => (
                  <button
                    key={item._id}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                      selectedDisputeId === item._id
                        ? "border-brand-300 bg-brand-50 shadow-sm"
                        : "border-brand-100/60 bg-white hover:bg-brand-50/50"
                    }`}
                    type="button"
                    onClick={() => setSelectedDisputeId(item._id)}
                  >
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <div className="mt-1"><Badge variant={statusBadge(item.status)}>{item.status.replace("_", " ")}</Badge></div>
                  </button>
                ))}
              </div>

              {/* Detail */}
              <div className="rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5">
                {loadingDetails ? <LoadingState label="Loading details..." /> : null}
                {!loadingDetails && !selectedDispute ? <EmptyState title="Select a dispute" description="Click on a dispute to view its details." /> : null}
                {!loadingDetails && selectedDispute ? (
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-bold text-slate-900">{selectedDispute.title}</p>
                      <Badge variant={statusBadge(selectedDispute.status)}>{selectedDispute.status.replace("_", " ")}</Badge>
                    </div>
                    <p><span className="font-semibold text-slate-900">Created:</span> {formatDate(selectedDispute.createdAt)}</p>
                    <p><span className="font-semibold text-slate-900">PSW:</span> {selectedDispute.pswId?.name || "N/A"}</p>
                    <p>
                      <span className="font-semibold text-slate-900">Appointment:</span>{" "}
                      {selectedDispute.appointmentId?.appointmentDate
                        ? `${new Date(selectedDispute.appointmentId.appointmentDate).toLocaleDateString()} ${selectedDispute.appointmentId?.appointmentTime || ""}`
                        : "N/A"}
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">Description</p>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{selectedDispute.description}</p>
                    </div>
                    {selectedDispute.resolutionNote ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="font-semibold text-emerald-800">Resolution Note</p>
                        <p className="mt-1 whitespace-pre-wrap text-emerald-700">{selectedDispute.resolutionNote}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        </section>
      </PageTransition>
    </main>
  );
};

export default ClientDisputesPage;
