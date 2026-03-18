import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerRequest } from "../services/authApi";
import {
  getDashboardPathByRole,
  setAuthSession,
} from "../services/authStorage";

const allowedRoles = ["client", "psw"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get("role");

  const initialRole = useMemo(() => {
    if (allowedRoles.includes(roleFromQuery)) {
      return roleFromQuery;
    }

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
    const validationErrors = {};

    if (form.name.trim().length < 2) {
      validationErrors.name = "Name must be at least 2 characters.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email.";
    }

    if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (!allowedRoles.includes(form.role)) {
      validationErrors.role = "Please select a valid role.";
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
      const response = await registerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setAuthSession({ token: response.token, user: response.user });
      navigate(getDashboardPathByRole(response.user.role), { replace: true });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(150deg,#f0f9ff_0%,#ecfeff_48%,#f8fafc_100%)] px-4 py-10">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-cyan-100 bg-white p-7 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.65)] md:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-slate-600">
          Register as a Client or PSW to continue.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="name"
            >
              Full name
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              id="name"
              name="name"
              onChange={handleChange}
              value={form.name}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </div>

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

          <div className="grid gap-4 md:grid-cols-2">
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

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                onChange={handleChange}
                value={form.confirmPassword}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="role"
            >
              Role
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              id="role"
              name="role"
              onChange={handleChange}
              value={form.role}
            >
              <option value="client">Client</option>
              <option value="psw">PSW</option>
            </select>
            {errors.role ? (
              <p className="mt-1 text-sm text-rose-600">{errors.role}</p>
            ) : null}
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="text-cyan-700 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
