import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";
import VerificationBadge from "../components/VerificationBadge";
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

const PSWProfileEditPage = () => {
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
  });

  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);

  const serviceList = useMemo(
    () => parseServices(form.servicesInput),
    [form.servicesInput],
  );

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
      });
    } catch (requestError) {
      if (requestError.response?.status !== 404) {
        setError(
          requestError.response?.data?.message || "Failed to load profile.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = () => {
    if (!form.location.trim()) {
      return "Location is required.";
    }

    if (!form.hourlyRate || Number(form.hourlyRate) < 0) {
      return "Hourly rate must be a non-negative number.";
    }

    if (!form.experience || Number(form.experience) < 0) {
      return "Experience must be a non-negative number.";
    }

    if (form.bio.trim().length > 2000) {
      return "Bio must be 2000 characters or fewer.";
    }

    return "";
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

      if (response.certificate?.pswProfileId) {
        await loadProfile();
      }
    } catch (requestError) {
      setUploadError(
        requestError.response?.data?.message || "Certificate upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSW Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Build your marketplace profile
              </h1>
              <p className="mt-1 text-slate-600">
                Keep your profile complete so clients can trust and book you
                quickly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <VerificationBadge
                status={profile?.verificationStatus || "pending"}
              />
              <Link
                className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
                to="/psw/dashboard"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </header>

        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        {isLoading ? (
          <p className="text-sm text-slate-600">Loading profile...</p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        {activeTab === "about" || activeTab === "services" ? (
          <form
            className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]"
            onSubmit={handleSaveProfile}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="bio"
                >
                  Professional bio
                </label>
                <textarea
                  className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="bio"
                  name="bio"
                  onChange={handleFormChange}
                  placeholder="Share your care specialties, communication style, and patient experience."
                  value={form.bio}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="hourlyRate"
                >
                  Hourly rate (CAD)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="hourlyRate"
                  min="0"
                  name="hourlyRate"
                  onChange={handleFormChange}
                  type="number"
                  value={form.hourlyRate}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="experience"
                >
                  Experience (years)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="experience"
                  min="0"
                  name="experience"
                  onChange={handleFormChange}
                  type="number"
                  value={form.experience}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="location"
                >
                  Location
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="location"
                  name="location"
                  onChange={handleFormChange}
                  placeholder="Example: Toronto, ON"
                  value={form.location}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="servicesInput"
                >
                  Services (comma-separated)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                  id="servicesInput"
                  name="servicesInput"
                  onChange={handleFormChange}
                  placeholder="Elderly care, Mobility support, Post-surgery support"
                  value={form.servicesInput}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceList.length > 0
                    ? serviceList.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800"
                        >
                          {service}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            </div>

            <button
              className="mt-6 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        ) : null}

        {activeTab === "certificates" ? (
          <section className="space-y-4 rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <h2 className="text-xl font-semibold text-slate-900">
              Certificates
            </h2>
            <p className="text-sm text-slate-600">
              Upload certifications in PDF or image format. Verification status
              is reviewed by admin.
            </p>

            <form
              className="flex flex-col gap-3 md:flex-row md:items-center"
              onSubmit={handleCertificateUpload}
            >
              <input
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                onChange={(event) =>
                  setCertificateFile(event.target.files?.[0] || null)
                }
                type="file"
              />
              <button
                className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUploading}
                type="submit"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {uploadError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {uploadError}
              </p>
            ) : null}

            <div className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No certificates uploaded yet.
                </p>
              ) : (
                certificates.map((certificate) => (
                  <article
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    key={certificate._id}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {certificate.originalFileName || "Certificate file"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uploaded{" "}
                        {new Date(certificate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
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
          <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="mt-2 text-sm text-slate-600">
              Reviews will appear here after completed appointments and client
              feedback.
            </p>
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default PSWProfileEditPage;
