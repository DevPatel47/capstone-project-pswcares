import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setSubmitted(false);
      setError("Please enter a valid email.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-10">
      <section className="mx-auto w-full max-w-lg rounded-2xl border border-cyan-100 bg-white p-7 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)] md:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Forgot password
        </h1>
        <p className="mt-2 text-slate-600">
          Enter your email and we will send reset instructions when password
          reset backend is enabled.
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
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
            {error ? (
              <p className="mt-1 text-sm text-rose-600">{error}</p>
            ) : null}
          </div>

          <button
            className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-700"
            type="submit"
          >
            Request reset link
          </button>
        </form>

        {submitted ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Reset request captured for {email}. This UI is ready and can be
            connected to backend endpoint later.
          </p>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          Back to{" "}
          <Link className="text-cyan-700 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
