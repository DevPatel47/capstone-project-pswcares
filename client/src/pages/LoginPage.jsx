import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../services/authApi";
import {
  getDashboardPathByRole,
  setAuthSession,
} from "../services/authStorage";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const validationErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email.";
    }

    if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters.";
    }

    return validationErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });

      setAuthSession({ token: response.token, user: response.user });
      navigate(getDashboardPathByRole(response.user.role), { replace: true });
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-10">
      <section className="mx-auto w-full max-w-lg rounded-2xl border border-cyan-100 bg-white p-7 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)] md:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-600">
          Sign in to access your PSWCares dashboard.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={form.email}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-rose-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={form.password}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
            ) : null}
          </div>

          <div className="text-right">
            <Link
              className="text-sm text-cyan-700 hover:underline"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          {apiError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {apiError}
            </div>
          ) : null}

          <button
            className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New to PSWCares?{" "}
          <Link className="text-cyan-700 hover:underline" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
