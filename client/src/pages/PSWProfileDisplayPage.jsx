import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";
import VerificationBadge from "../components/VerificationBadge";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageTransition from "../components/ui/PageTransition";
import { getAuthSession } from "../services/authStorage";
import { getPublicPSWProfileRequest } from "../services/pswProfileApi";
import {
  getPSWReviewsRequest,
  submitReviewRequest,
} from "../services/reviewApi";

const demoProfiles = {
  "demo-approved": {
    profile: {
      _id: "demo-approved",
      bio: "Compassionate PSW with a focus on post-recovery routines, medication reminders, and emotional support for seniors.",
      services: ["Elderly care", "Disability support", "Post-recovery care", "Companionship"],
      hourlyRate: 36,
      experience: 6,
      location: "Toronto, ON",
      verificationStatus: "approved",
    },
    certificates: [
      { _id: "c1", originalFileName: "PSW-Certificate-Level-2.pdf", fileUrl: "#" },
      { _id: "c2", originalFileName: "First-Aid-and-CPR.pdf", fileUrl: "#" },
    ],
    reviews: [
      { _id: "r1", author: "Sarah T.", rating: 5, comment: "Reliable and incredibly patient with my mother during recovery." },
      { _id: "r2", author: "David R.", rating: 5, comment: "Professional, organized, and very kind. Highly recommended." },
    ],
  },
};

const PSWProfileDisplayPage = () => {
  const { profileId } = useParams();
  const location = useLocation();
  const session = getAuthSession();
  const currentRole = session?.user?.role;
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [eligibleAppointments, setEligibleAppointments] = useState([]);
  const [reviewForm, setReviewForm] = useState({ appointmentId: "", rating: 5, comment: "" });
  const [payload, setPayload] = useState(() => {
    if (location.state?.profile) return { profile: location.state.profile, certificates: [], reviews: [] };
    return null;
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPublicPSWProfileRequest(profileId);
        setPayload(data);
      } catch (_requestError) {
        if (demoProfiles[profileId]) setPayload(demoProfiles[profileId]);
        else if (location.state?.profile) setPayload({ profile: location.state.profile, certificates: [], reviews: [] });
        else setError("Profile not found.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [location.state, profileId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getPSWReviewsRequest(profileId);
        setPayload((prev) => ({ profile: prev?.profile || data.profile, certificates: prev?.certificates || [], reviews: data.reviews || [] }));
        const appointments = data.eligibleAppointments || [];
        setEligibleAppointments(appointments);
        setReviewForm((prev) => ({ ...prev, appointmentId: appointments[0]?._id || "" }));
      } catch (_requestError) { /* Keep profile visible */ }
    };
    if (profileId) loadReviews();
  }, [profileId]);

  const profile = payload?.profile;
  const certificates = payload?.certificates || [];
  const reviews = payload?.reviews || [];

  const averageRating = useMemo(() => {
    if (profile?.averageRating && Number(profile.averageRating) > 0) return Number(profile.averageRating).toFixed(1);
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    if (!reviewForm.appointmentId) { setReviewError("Please choose a completed appointment."); return; }
    if (Number(reviewForm.rating) < 1 || Number(reviewForm.rating) > 5) { setReviewError("Rating must be between 1 and 5."); return; }
    setIsSubmittingReview(true);
    try {
      await submitReviewRequest({ appointmentId: reviewForm.appointmentId, rating: Number(reviewForm.rating), comment: reviewForm.comment });
      const data = await getPSWReviewsRequest(profileId);
      setPayload((prev) => ({ profile: data.profile || prev?.profile, certificates: prev?.certificates || [], reviews: data.reviews || [] }));
      const appointments = data.eligibleAppointments || [];
      setEligibleAppointments(appointments);
      setReviewForm({ appointmentId: appointments[0]?._id || "", rating: 5, comment: "" });
      setReviewSuccess("Review submitted successfully.");
    } catch (requestError) {
      setReviewError(requestError.response?.data?.message || "Unable to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const providerName = profile?.userId?.name || "PSW";

  return (
    <main className="app-bg px-4 py-8">
      <PageTransition className="mx-auto w-full max-w-6xl space-y-6">
        <header className="app-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={providerName} size="lg" />
              <div>
                <p className="page-label">PSW Profile</p>
                <h1 className="page-title !text-2xl">{providerName}</h1>
                <p className="page-subtitle text-sm">Review details before booking care services.</p>
              </div>
            </div>
            {profile ? <VerificationBadge status={profile.verificationStatus} /> : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

            {isLoading ? <LoadingState label="Loading profile..." /> : null}
            {error ? <ErrorBanner message={error} /> : null}

            {profile && activeTab === "about" ? (
              <section className="app-card">
                <h2 className="text-xl font-bold text-slate-900">About</h2>
                <p className="mt-3 leading-7 text-slate-600">{profile.bio || "No bio available."}</p>
              </section>
            ) : null}

            {profile && activeTab === "services" ? (
              <section className="app-card">
                <h2 className="text-xl font-bold text-slate-900">Services</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.services?.length > 0 ? (
                    profile.services.map((service) => <Badge key={service} variant="info">{service}</Badge>)
                  ) : (
                    <p className="text-sm text-slate-500">No services listed yet.</p>
                  )}
                </div>
              </section>
            ) : null}

            {profile && activeTab === "certificates" ? (
              <section className="app-card">
                <h2 className="text-xl font-bold text-slate-900">Certificates</h2>
                <div className="mt-4 space-y-3">
                  {certificates.length > 0 ? (
                    certificates.map((cert) => (
                      <article className="rounded-xl border border-brand-100/60 bg-brand-50/20 px-4 py-3 flex items-center justify-between" key={cert._id}>
                        <p className="text-sm font-medium text-slate-800">{cert.originalFileName || "Certificate"}</p>
                        {cert.fileUrl && cert.fileUrl !== "#" ? (
                          <a className="btn-outline btn-sm" href={cert.fileUrl} rel="noreferrer" target="_blank">Open</a>
                        ) : null}
                      </article>
                    ))
                  ) : (
                    <EmptyState title="No certificates" description="No certificates available for this provider." />
                  )}
                </div>
              </section>
            ) : null}

            {profile && activeTab === "reviews" ? (
              <section className="app-card">
                <h2 className="text-xl font-bold text-slate-900">Reviews</h2>

                {currentRole === "client" ? (
                  <form className="mt-4 space-y-3 rounded-xl border border-brand-100/60 bg-brand-50/20 p-4" onSubmit={handleReviewSubmit}>
                    <h3 className="text-sm font-bold text-slate-900">Submit review</h3>
                    {eligibleAppointments.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                        <select className="app-select" onChange={(e) => setReviewForm((prev) => ({ ...prev, appointmentId: e.target.value }))} value={reviewForm.appointmentId}>
                          {eligibleAppointments.map((item) => (
                            <option key={item._id} value={item._id}>
                              {new Date(item.appointmentDate).toLocaleDateString()} {item.appointmentTime}
                            </option>
                          ))}
                        </select>
                        <select className="app-select" onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} value={reviewForm.rating}>
                          {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} star{v > 1 ? "s" : ""}</option>)}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Only available for completed, unreviewed appointments.</p>
                    )}
                    <textarea className="app-input min-h-24 resize-none" onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience" value={reviewForm.comment} />
                    {reviewError ? <ErrorBanner message={reviewError} compact /> : null}
                    {reviewSuccess ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">{reviewSuccess}</div>
                    ) : null}
                    <button className="btn-primary btn-sm" disabled={eligibleAppointments.length === 0 || isSubmittingReview} type="submit">
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : null}

                <div className="mt-4 space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <article className="rounded-xl border border-brand-100/60 bg-white px-4 py-3" key={review._id}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={review.clientId?.name || review.author || "Client"} size="sm" />
                            <p className="text-sm font-medium text-slate-800">{review.clientId?.name || review.author || "Client"}</p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-sm font-semibold">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      </article>
                    ))
                  ) : (
                    <EmptyState title="No reviews yet" description="Be the first to leave a review." />
                  )}
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="h-fit app-card">
            <h2 className="text-lg font-bold text-slate-900">At a glance</h2>
            {profile ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  ["Hourly rate", `$${profile.hourlyRate}/hr`],
                  ["Experience", `${profile.experience} years`],
                  ["Location", profile.location],
                  ["Rating", averageRating ? `${averageRating} / 5` : "No ratings yet"],
                  ["Reviews", profile.reviewCount || reviews.length],
                ].map(([k, v]) => (
                  <p key={k}><span className="font-semibold text-slate-900">{k}:</span> {v}</p>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Profile details unavailable.</p>
            )}
            {profile ? (
              <Link
                className="btn-primary w-full mt-5 text-center"
                state={{ profile }}
                to={`/client/booking?pswId=${encodeURIComponent(profile.userId?._id || profile.userId || "")}&pswName=${encodeURIComponent(profile.userId?.name || "")}`}
              >
                Start Booking
              </Link>
            ) : null}
            <Link className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700" to="/client/dashboard">
              ← Back to dashboard
            </Link>
          </aside>
        </div>
      </PageTransition>
    </main>
  );
};

export default PSWProfileDisplayPage;
