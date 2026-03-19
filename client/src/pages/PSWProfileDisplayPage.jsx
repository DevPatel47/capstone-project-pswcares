import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";
import VerificationBadge from "../components/VerificationBadge";
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
      services: [
        "Elderly care",
        "Disability support",
        "Post-recovery care",
        "Companionship",
      ],
      hourlyRate: 36,
      experience: 6,
      location: "Toronto, ON",
      verificationStatus: "approved",
    },
    certificates: [
      {
        _id: "c1",
        originalFileName: "PSW-Certificate-Level-2.pdf",
        fileUrl: "#",
      },
      {
        _id: "c2",
        originalFileName: "First-Aid-and-CPR.pdf",
        fileUrl: "#",
      },
    ],
    reviews: [
      {
        _id: "r1",
        author: "Sarah T.",
        rating: 5,
        comment:
          "Reliable and incredibly patient with my mother during recovery.",
      },
      {
        _id: "r2",
        author: "David R.",
        rating: 5,
        comment: "Professional, organized, and very kind. Highly recommended.",
      },
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
  const [reviewForm, setReviewForm] = useState({
    appointmentId: "",
    rating: 5,
    comment: "",
  });
  const [payload, setPayload] = useState(() => {
    if (location.state?.profile) {
      return {
        profile: location.state.profile,
        certificates: [],
        reviews: [],
      };
    }

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
        if (demoProfiles[profileId]) {
          setPayload(demoProfiles[profileId]);
        } else if (location.state?.profile) {
          setPayload({
            profile: location.state.profile,
            certificates: [],
            reviews: [],
          });
        } else {
          setError("Profile not found.");
        }
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

        setPayload((prev) => ({
          profile: prev?.profile || data.profile,
          certificates: prev?.certificates || [],
          reviews: data.reviews || [],
        }));

        const appointments = data.eligibleAppointments || [];
        setEligibleAppointments(appointments);

        setReviewForm((prev) => ({
          ...prev,
          appointmentId: appointments[0]?._id || "",
        }));
      } catch (_requestError) {
        // Keep profile visible even if reviews fail to load.
      }
    };

    if (profileId) {
      loadReviews();
    }
  }, [profileId]);

  const profile = payload?.profile;
  const certificates = payload?.certificates || [];
  const reviews = payload?.reviews || [];

  const averageRating = useMemo(() => {
    if (profile?.averageRating && Number(profile.averageRating) > 0) {
      return Number(profile.averageRating).toFixed(1);
    }

    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!reviewForm.appointmentId) {
      setReviewError("Please choose a completed appointment.");
      return;
    }

    if (Number(reviewForm.rating) < 1 || Number(reviewForm.rating) > 5) {
      setReviewError("Rating must be between 1 and 5.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      await submitReviewRequest({
        appointmentId: reviewForm.appointmentId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      const data = await getPSWReviewsRequest(profileId);

      setPayload((prev) => ({
        profile: data.profile || prev?.profile,
        certificates: prev?.certificates || [],
        reviews: data.reviews || [],
      }));

      const appointments = data.eligibleAppointments || [];
      setEligibleAppointments(appointments);
      setReviewForm({
        appointmentId: appointments[0]?._id || "",
        rating: 5,
        comment: "",
      });

      setReviewSuccess("Review submitted successfully.");
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || "Unable to submit review.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSW Marketplace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                PSW Profile
              </h1>
              <p className="mt-1 text-slate-600">
                Review provider details before booking care services.
              </p>
            </div>
            {profile ? (
              <VerificationBadge status={profile.verificationStatus} />
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

            {isLoading ? (
              <p className="text-sm text-slate-600">Loading profile...</p>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {profile && activeTab === "about" ? (
              <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
                <h2 className="text-xl font-semibold text-slate-900">About</h2>
                <p className="mt-3 leading-7 text-slate-700">
                  {profile.bio || "No bio available."}
                </p>
              </section>
            ) : null}

            {profile && activeTab === "services" ? (
              <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
                <h2 className="text-xl font-semibold text-slate-900">
                  Services
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.services?.length > 0 ? (
                    profile.services.map((service) => (
                      <span
                        className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800"
                        key={service}
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">
                      No services listed yet.
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {profile && activeTab === "certificates" ? (
              <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
                <h2 className="text-xl font-semibold text-slate-900">
                  Certificates
                </h2>
                <div className="mt-4 space-y-3">
                  {certificates.length > 0 ? (
                    certificates.map((certificate) => (
                      <article
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        key={certificate._id}
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {certificate.originalFileName || "Certificate"}
                        </p>
                        {certificate.fileUrl && certificate.fileUrl !== "#" ? (
                          <a
                            className="mt-1 inline-block text-sm text-cyan-700 hover:text-cyan-900"
                            href={certificate.fileUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open file
                          </a>
                        ) : null}
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">
                      No certificates available.
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {profile && activeTab === "reviews" ? (
              <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
                <h2 className="text-xl font-semibold text-slate-900">
                  Reviews
                </h2>

                {currentRole === "client" ? (
                  <form
                    className="mt-4 space-y-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4"
                    onSubmit={handleReviewSubmit}
                  >
                    <h3 className="text-sm font-semibold text-slate-900">
                      Submit review
                    </h3>

                    {eligibleAppointments.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                        <select
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                          onChange={(event) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              appointmentId: event.target.value,
                            }))
                          }
                          value={reviewForm.appointmentId}
                        >
                          {eligibleAppointments.map((item) => (
                            <option key={item._id} value={item._id}>
                              {new Date(
                                item.appointmentDate,
                              ).toLocaleDateString()}{" "}
                              {item.appointmentTime}
                            </option>
                          ))}
                        </select>

                        <select
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                          onChange={(event) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: Number(event.target.value),
                            }))
                          }
                          value={reviewForm.rating}
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value} star{value > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        Review submission is available only for your completed
                        appointments that have not been reviewed.
                      </p>
                    )}

                    <textarea
                      className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                      onChange={(event) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          comment: event.target.value,
                        }))
                      }
                      placeholder="Share your experience"
                      value={reviewForm.comment}
                    />

                    {reviewError ? (
                      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        {reviewError}
                      </p>
                    ) : null}

                    {reviewSuccess ? (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        {reviewSuccess}
                      </p>
                    ) : null}

                    <button
                      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={
                        eligibleAppointments.length === 0 || isSubmittingReview
                      }
                      type="submit"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : null}

                <div className="mt-4 space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <article
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        key={review._id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-800">
                            {review.clientId?.name || review.author || "Client"}
                          </p>
                          <p className="text-sm font-semibold text-amber-600">
                            {review.rating}.0 / 5
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">
                          {review.comment}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">No reviews yet.</p>
                  )}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <h2 className="text-lg font-semibold text-slate-900">
              At a glance
            </h2>
            {profile ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">
                    Hourly rate:
                  </span>{" "}
                  ${profile.hourlyRate}/hr
                </p>
                <p>
                  <span className="font-semibold text-slate-900">
                    Experience:
                  </span>{" "}
                  {profile.experience} years
                </p>
                <p>
                  <span className="font-semibold text-slate-900">
                    Location:
                  </span>{" "}
                  {profile.location}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Rating:</span>{" "}
                  {averageRating ? `${averageRating} / 5` : "No ratings yet"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Reviews:</span>{" "}
                  {profile.reviewCount || reviews.length}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Profile details unavailable.
              </p>
            )}
            {profile ? (
              <Link
                className="mt-2 inline-block w-full rounded-lg border border-cyan-200 px-4 py-2.5 text-center text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                state={{ profile }}
                to={`/client/booking?pswId=${encodeURIComponent(
                  profile.userId?._id || profile.userId || "",
                )}&pswName=${encodeURIComponent(profile.userId?.name || "")}`}
              >
                Start Booking Flow
              </Link>
            ) : null}
            <Link
              className="mt-4 inline-block text-sm text-cyan-700 hover:text-cyan-900"
              to="/client/dashboard"
            >
              Back to dashboard
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default PSWProfileDisplayPage;
