import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";
import VerificationBadge from "../components/VerificationBadge";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageTransition from "../components/ui/PageTransition";
import {
  getMyPSWProfileRequest,
  uploadMyCertificateRequest,
  upsertMyPSWProfileRequest,
} from "../services/pswProfileApi";

const parseServices = (value) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const AVAILABILITY_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const buildAvailabilityFormState = (slots = []) => {
  return AVAILABILITY_DAYS.reduce((acc, day) => {
    const slot = (slots || []).find((item) => item.dayOfWeek === day.key);
    acc[day.key] = {
      enabled: Boolean(slot),
      startTime: slot?.startTime || "09:00",
      endTime: slot?.endTime || "17:00",
    };
    return acc;
  }, {});
};

const availabilityToPayload = (availabilityState) => {
  return AVAILABILITY_DAYS.map((day) => ({
    dayOfWeek: day.key,
    ...availabilityState[day.key],
  }))
    .filter((slot) => slot.enabled)
    .map(({ dayOfWeek, startTime, endTime }) => ({
      dayOfWeek,
      startTime,
      endTime,
    }));
};

const parseTimeToMinutes = (value) => {
  const [h, m] = String(value).split(":").map(Number);
  return h * 60 + m;
};

const PSWProfileEditPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);

  const [form, setForm] = useState({
    bio: "",
    servicesInput: "",
    hourlyRate: "",
    experience: "",
    location: "",
    availability: buildAvailabilityFormState(),
  });
  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);

  const serviceList = useMemo(
    () => parseServices(form.servicesInput),
    [form.servicesInput],
  );

  const verificationStatus = profile?.verificationStatus || "pending";
  const isApproved = verificationStatus === "approved";

  useEffect(() => {
    const requestedTab = location.state?.activeTab;
    const validTabs = [
      "about",
      "services",
      "availability",
      "certificates",
      "reviews",
    ];
    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [location.state]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getMyPSWProfileRequest();
      setProfile(data.profile);
      setCertificates(data.certificates || []);
      setForm({
        bio: data.profile?.bio || "",
        servicesInput: (data.profile?.services || []).join(", "),
        hourlyRate: String(data.profile?.hourlyRate ?? ""),
        experience: String(data.profile?.experience ?? ""),
        location: data.profile?.location || "",
        availability: buildAvailabilityFormState(
          data.profile?.availability || [],
        ),
      });
    } catch (requestError) {
      if (requestError.response?.status !== 404)
        setError(
          requestError.response?.data?.message || "Failed to load profile.",
        );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = () => {
    if (!form.location.trim()) return "Location is required.";
    if (!form.hourlyRate || Number(form.hourlyRate) < 0)
      return "Hourly rate must be a non-negative number.";
    if (!form.experience || Number(form.experience) < 0)
      return "Experience must be a non-negative number.";
    if (form.bio.trim().length > 2000)
      return "Bio must be 2000 characters or fewer.";
    for (const day of AVAILABILITY_DAYS) {
      const slot = form.availability[day.key];
      if (!slot?.enabled) continue;
      if (!slot.startTime || !slot.endTime)
        return `Select start and end time for ${day.label}.`;
      if (
        parseTimeToMinutes(slot.endTime) <= parseTimeToMinutes(slot.startTime)
      ) {
        return `${day.label}: end time must be later than start time.`;
      }
    }
    return "";
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityToggle = (dayKey) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          enabled: !prev.availability[dayKey]?.enabled,
        },
      },
    }));
  };

  const handleAvailabilityTimeChange = (dayKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    try {
      const response = await upsertMyPSWProfileRequest({
        bio: form.bio.trim(),
        services: serviceList,
        hourlyRate: Number(form.hourlyRate),
        experience: Number(form.experience),
        location: form.location.trim(),
        availability: availabilityToPayload(form.availability),
      });
      setProfile(response.profile);
      setSuccess("Profile saved successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCertificateUpload = async (event) => {
    event.preventDefault();
    setUploadError("");
    setSuccess("");
    if (!certificateFile) {
      setUploadError("Please choose a certificate file.");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadMyCertificateRequest(certificateFile);
      setCertificates((prev) => [response.certificate, ...prev]);
      setCertificateFile(null);
      setSuccess("Certificate uploaded successfully.");
      if (response.certificate?.pswProfileId) await loadProfile();
    } catch (requestError) {
      setUploadError(
        requestError.response?.data?.message || "Certificate upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="app-bg px-4 py-8">
      <PageTransition className="mx-auto w-full max-w-6xl space-y-6">
        <header className="app-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="page-label">PSW Profile</p>
              <h1 className="page-title !text-2xl">
                Build your marketplace profile
              </h1>
              <p className="page-subtitle text-sm">
                Keep your profile complete so clients can trust and book you
                quickly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <VerificationBadge
                status={profile?.verificationStatus || "pending"}
              />
              {isApproved ? (
                <Link className="btn-outline btn-sm" to="/psw/dashboard">
                  ← Dashboard
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {!isLoading && (
          <section className="app-card border-l-4 border-l-amber-400">
            <h2 className="text-base font-bold text-slate-900">
              Approval status: {verificationStatus}
            </h2>
            {verificationStatus === "approved" ? (
              <p className="mt-2 text-sm text-emerald-700">
                Your profile is approved. You can access dashboard and messages.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Complete your setup details and wait for admin approval. Until
                then, dashboard and chat are unavailable.
              </p>
            )}
            {location.state?.approvalRequired ? (
              <p className="mt-2 text-xs text-amber-700">
                Approval is required before you can access the PSW dashboard.
              </p>
            ) : null}
            {verificationStatus === "rejected" && profile?.verificationNote ? (
              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                Admin note: {profile.verificationNote}
              </p>
            ) : null}
          </section>
        )}

        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        {isLoading ? <LoadingState label="Loading profile..." /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {activeTab === "about" ||
        activeTab === "services" ||
        activeTab === "availability" ? (
          <form className="app-card" onSubmit={handleSaveProfile}>
            <div className="grid gap-5 md:grid-cols-2">
              {activeTab === "about" ? (
                <>
                  <div className="md:col-span-2">
                    <label className="app-label" htmlFor="bio">
                      Professional bio
                    </label>
                    <textarea
                      className="app-input min-h-32 resize-none"
                      id="bio"
                      name="bio"
                      onChange={handleFormChange}
                      placeholder="Share your care specialties, communication style, and patient experience."
                      value={form.bio}
                    />
                  </div>

                  <div>
                    <label className="app-label" htmlFor="hourlyRate">
                      Hourly rate (CAD)
                    </label>
                    <input
                      className="app-input"
                      id="hourlyRate"
                      min="0"
                      name="hourlyRate"
                      onChange={handleFormChange}
                      type="number"
                      value={form.hourlyRate}
                    />
                  </div>

                  <div>
                    <label className="app-label" htmlFor="experience">
                      Experience (years)
                    </label>
                    <input
                      className="app-input"
                      id="experience"
                      min="0"
                      name="experience"
                      onChange={handleFormChange}
                      type="number"
                      value={form.experience}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label" htmlFor="location">
                      Location
                    </label>
                    <input
                      className="app-input"
                      id="location"
                      name="location"
                      onChange={handleFormChange}
                      placeholder="Example: Toronto, ON"
                      value={form.location}
                    />
                  </div>
                </>
              ) : null}

              {activeTab === "services" ? (
                <div className="md:col-span-2">
                  <label className="app-label" htmlFor="servicesInput">
                    Services (comma-separated)
                  </label>
                  <input
                    className="app-input"
                    id="servicesInput"
                    name="servicesInput"
                    onChange={handleFormChange}
                    placeholder="Elderly care, Mobility support, Post-surgery support"
                    value={form.servicesInput}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {serviceList.length > 0
                      ? serviceList.map((service) => (
                          <Badge key={service} variant="info">
                            {service}
                          </Badge>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}

              {activeTab === "availability" ? (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">
                    Set when clients can book you each week.
                  </p>
                  <div className="mt-4 space-y-3">
                    {AVAILABILITY_DAYS.map((day) => {
                      const slot = form.availability[day.key];
                      return (
                        <div
                          className="rounded-xl border border-brand-100/60 bg-brand-50/20 p-3"
                          key={day.key}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                              <input
                                checked={Boolean(slot?.enabled)}
                                className="h-4 w-4 rounded border-slate-300"
                                onChange={() =>
                                  handleAvailabilityToggle(day.key)
                                }
                                type="checkbox"
                              />
                              {day.label}
                            </label>
                            <div className="grid grid-cols-2 gap-2 md:w-[270px]">
                              <input
                                className="app-input"
                                disabled={!slot?.enabled}
                                onChange={(event) =>
                                  handleAvailabilityTimeChange(
                                    day.key,
                                    "startTime",
                                    event.target.value,
                                  )
                                }
                                type="time"
                                value={slot?.startTime || "09:00"}
                              />
                              <input
                                className="app-input"
                                disabled={!slot?.enabled}
                                onChange={(event) =>
                                  handleAvailabilityTimeChange(
                                    day.key,
                                    "endTime",
                                    event.target.value,
                                  )
                                }
                                type="time"
                                value={slot?.endTime || "17:00"}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              className="btn-primary mt-6"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        ) : null}

        {activeTab === "certificates" ? (
          <section className="app-card space-y-5">
            <h2 className="text-xl font-bold text-slate-900">Certificates</h2>
            <p className="text-sm text-slate-500">
              Upload certifications in PDF or image format. Verification status
              is reviewed by admin.
            </p>

            <form
              className="flex flex-col gap-3 md:flex-row md:items-center"
              onSubmit={handleCertificateUpload}
            >
              <input
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="app-input flex-1"
                onChange={(event) =>
                  setCertificateFile(event.target.files?.[0] || null)
                }
                type="file"
              />
              <button
                className="btn-primary btn-sm"
                disabled={isUploading}
                type="submit"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {uploadError ? <ErrorBanner message={uploadError} compact /> : null}

            <div className="space-y-3">
              {certificates.length === 0 ? (
                <EmptyState
                  title="No certificates uploaded"
                  description="Upload your first certificate to start verification."
                />
              ) : (
                certificates.map((certificate) => (
                  <article
                    className="flex items-center justify-between rounded-xl border border-brand-100/60 bg-brand-50/20 px-4 py-3"
                    key={certificate._id}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {certificate.originalFileName || "Certificate file"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Uploaded{" "}
                        {new Date(certificate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      className="btn-outline btn-sm"
                      href={certificate.fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View file
                    </a>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "reviews" ? (
          <section className="app-card">
            <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
            <p className="mt-2 text-sm text-slate-500">
              Reviews will appear here after completed appointments and client
              feedback.
            </p>
          </section>
        ) : null}
      </PageTransition>
    </main>
  );
};

export default PSWProfileEditPage;
