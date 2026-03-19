import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getMyAppointmentsRequest } from "../services/appointmentApi";
import {
  createDisputeRequest,
  getDisputeDetailsRequest,
  getMyDisputesRequest,
} from "../services/disputeApi";

const STATUS_FILTERS = ["all", "open", "in_review", "resolved"];

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

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
  const [form, setForm] = useState({
    appointmentId: "",
    title: "",
    description: "",
  });
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
      const ownAppointments = (data.items || []).filter(
        (item) => item.clientId?._id,
      );
      setAppointments(ownAppointments);
      if (!form.appointmentId && ownAppointments[0]?._id) {
        setForm((prev) => ({ ...prev, appointmentId: ownAppointments[0]._id }));
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to load appointments for dispute reporting.";
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
      const data = await getMyDisputesRequest({
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (requestId !== listRequestIdRef.current) {
        return;
      }

      const items = data.items || [];
      setDisputes(items);

      if (items.length === 0) {
        setSelectedDisputeId("");
        setSelectedDispute(null);
        return;
      }

      const preferredSelection = preferredId || selectedDisputeId;
      const hasPreferred = items.some(
        (item) => item._id === preferredSelection,
      );
      setSelectedDisputeId(hasPreferred ? preferredSelection : items[0]._id);
    } catch (requestError) {
      setListError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load disputes.",
      );
    } finally {
      if (requestId === listRequestIdRef.current) {
        setLoadingList(false);
      }
    }
  };

  const loadDetails = async (disputeId) => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;

    if (!disputeId) {
      setSelectedDispute(null);
      return;
    }

    setLoadingDetails(true);
    setDetailError("");

    try {
      const data = await getDisputeDetailsRequest(disputeId);
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
      setSelectedDispute(null);
    } finally {
      if (requestId === detailRequestIdRef.current) {
        setLoadingDetails(false);
      }
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  useEffect(() => {
    loadDetails(selectedDisputeId);
  }, [selectedDisputeId]);

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
      const data = await createDisputeRequest({
        appointmentId: form.appointmentId,
        title: form.title.trim(),
        description: form.description.trim(),
      });

      setSuccess("Dispute reported successfully.");
      toast.success("Dispute reported successfully.");
      setForm((prev) => ({ ...prev, title: "", description: "" }));

      if (data?.dispute?._id) {
        await loadDisputes({ preferredId: data.dispute._id });
      } else {
        await loadDisputes();
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Failed to submit dispute.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                Client Support
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Disputes</h1>
              <p className="mt-1 text-slate-600">
                Report issues and track resolution progress.
              </p>
            </div>
            <Link
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
              to="/client/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <article className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <h2 className="text-lg font-semibold">Report Issue</h2>
            {loadingAppointments ? (
              <p className="mt-3 text-sm text-slate-500">
                Loading appointments...
              </p>
            ) : null}
            {appointmentsWarning ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {appointmentsWarning}
              </p>
            ) : null}
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <select
                className="w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                value={form.appointmentId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    appointmentId: event.target.value,
                  }))
                }
              >
                <option value="">Select appointment</option>
                {appointmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                className="w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                placeholder="Issue title"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />

              <textarea
                className="min-h-28 w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                placeholder="Describe what happened"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />

              <button
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
            </form>

            {success ? (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
            {submitError ? (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">My Disputes</h2>
              <select
                className="rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All" : status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {listError ? (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {listError}
              </p>
            ) : null}
            {detailError ? (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {detailError}
              </p>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="space-y-2">
                {loadingList ? (
                  <p className="text-sm text-slate-500">Loading list...</p>
                ) : null}
                {!loadingList && disputes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No disputes reported.
                  </p>
                ) : null}

                {disputes.map((item) => (
                  <button
                    key={item._id}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                      selectedDisputeId === item._id
                        ? "border-cyan-300 bg-cyan-50"
                        : "border-cyan-100 bg-white hover:bg-cyan-50"
                    }`}
                    type="button"
                    onClick={() => setSelectedDisputeId(item._id)}
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
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="text-base font-semibold text-slate-900">
                      {selectedDispute.title}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {selectedDispute.status}
                    </p>
                    <p>
                      <span className="font-semibold">Created:</span>{" "}
                      {formatDate(selectedDispute.createdAt)}
                    </p>
                    <p>
                      <span className="font-semibold">PSW:</span>{" "}
                      {selectedDispute.pswId?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Appointment:</span>{" "}
                      {selectedDispute.appointmentId?.appointmentDate
                        ? `${new Date(selectedDispute.appointmentId.appointmentDate).toLocaleDateString()} ${selectedDispute.appointmentId?.appointmentTime || ""}`
                        : "N/A"}
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {selectedDispute.description}
                      </p>
                    </div>
                    {selectedDispute.resolutionNote ? (
                      <div>
                        <p className="font-semibold text-slate-900">
                          Resolution Note
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">
                          {selectedDispute.resolutionNote}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
};

export default ClientDisputesPage;
