import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import LoadingState from "../components/LoadingState";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageTransition from "../components/ui/PageTransition";
import { useToast } from "../context/ToastContext";
import { loginRequest } from "../services/authApi";
import {
  getDashboardPathByRole,
  setAuthSession,
} from "../services/authStorage";
import { isValidEmail } from "../services/validation";

const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const v = {};
    if (!isValidEmail(form.email)) v.email = "Please enter a valid email.";
    if (!String(form.password || "").trim())
      v.password = "Password is required.";
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
      const res = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });
      setAuthSession({
        token: res.token || res.accessToken || res.jwt,
        user: res.user,
      });
      toast.success("Signed in successfully.");
      navigate(getDashboardPathByRole(res.user.role), { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-bg flex items-center justify-center px-4 py-12">
      <PageTransition className="w-full max-w-md">
        <section className="app-card !p-8 md:!p-10">
          {/* Logo */}
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

          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to access your dashboard.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
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

            <div className="text-right">
              <Link
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <ErrorBanner message={apiError} compact />

            {isSubmitting ? (
              <LoadingState compact label="Verifying credentials..." />
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to PSWCares?{" "}
            <Link
              className="font-semibold text-brand-600 hover:text-brand-700"
              to="/register"
            >
              Create account
            </Link>
          </p>
        </section>
      </PageTransition>
    </main>
  );
};

export default LoginPage;
