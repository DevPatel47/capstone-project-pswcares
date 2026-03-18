import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";
import VerificationBadge from "../components/VerificationBadge";
import { getPublicPSWProfileRequest } from "../services/pswProfileApi";

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
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

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
        } else {
          setError("Profile not found.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const profile = payload?.profile;
  const certificates = payload?.certificates || [];
  const reviews = payload?.reviews || [];

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

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
                <div className="mt-4 space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <article
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        key={review._id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-800">
                            {review.author}
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
                <button
                  className="mt-2 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  type="button"
                >
                  Request Booking
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Profile details unavailable.
              </p>
            )}
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
