import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageTransition from "../components/ui/PageTransition";

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
    <main className="app-bg flex items-center justify-center px-4 py-12">
      <PageTransition className="w-full max-w-md">
        <section className="app-card !p-8 md:!p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PSWCares</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your email and we&apos;ll send reset instructions.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              placeholder="you@example.com"
            />

            <Button type="submit" className="w-full">
              Request reset link
            </Button>
          </form>

          {submitted ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Reset request captured for <span className="font-semibold">{email}</span>.</p>
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-center text-sm text-slate-500">
            Back to{" "}
            <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/login">
              Login
            </Link>
          </p>
        </section>
      </PageTransition>
    </main>
  );
};

export default ForgotPasswordPage;
