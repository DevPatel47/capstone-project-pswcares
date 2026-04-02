import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import LoadingState from "../components/LoadingState";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageTransition from "../components/ui/PageTransition";
import { useToast } from "../context/ToastContext";
import { registerRequest } from "../services/authApi";
import {
  getDashboardPathByRole,
  setAuthSession,
} from "../services/authStorage";
import { hasMinLength, isValidEmail } from "../services/validation";

const allowedRoles = ["client", "psw"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get("role");

  const initialRole = useMemo(() => {
    if (allowedRoles.includes(roleFromQuery)) return roleFromQuery;
    return "client";
  }, [roleFromQuery]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const v = {};
    if (!hasMinLength(form.name, 2))
      v.name = "Name must be at least 2 characters.";
    if (!isValidEmail(form.email)) v.email = "Please enter a valid email.";
    if (!hasMinLength(form.password, 8))
      v.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password)
      v.confirmPassword = "Passwords do not match.";
    if (!allowedRoles.includes(form.role))
      v.role = "Please select a valid role.";
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await registerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setAuthSession({
        token: res.token || res.accessToken || res.jwt,
        user: res.user,
      });
      toast.success("Account created successfully.");
      navigate(getDashboardPathByRole(res.user.role), { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-bg flex items-center justify-center px-4 py-12">
      <PageTransition className="w-full max-w-lg">
        <section className="app-card !p-8 md:!p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              PSWCares
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Register as a Client or PSW to get started.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Full name"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
            />

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <Input
                label="Confirm password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="app-label" htmlFor="role">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "client",
                    label: "Client",
                    desc: "Looking for care",
                  },
                  { value: "psw", label: "PSW", desc: "Providing care" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, role: option.value }))
                    }
                    className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.role === option.value
                        ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${form.role === option.value ? "text-brand-700" : "text-slate-900"}`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
              {errors.role ? <p className="app-error">{errors.role}</p> : null}
            </div>

            <ErrorBanner message={apiError} compact />
            {isSubmitting ? (
              <LoadingState compact label="Creating account..." />
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              className="font-semibold text-brand-600 hover:text-brand-700"
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </section>
      </PageTransition>
    </main>
  );
};

export default RegisterPage;
