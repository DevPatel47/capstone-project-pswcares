import { Link, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../services/authStorage";

const DashboardShell = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const session = getAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] text-slate-900">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSWCares Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
              <p className="mt-1 text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600">{session?.user?.email}</p>
              <button
                className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <article className="rounded-2xl border border-cyan-100 bg-white p-6 text-slate-700 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <p>
            Authentication UI is active. You are logged in as
            <span className="ml-2 rounded bg-cyan-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
              {session?.user?.role}
            </span>
            .
          </p>
          <p className="mt-3 text-sm text-slate-600">
            This is a starter dashboard placeholder for role-based redirects.
          </p>
          <Link
            className="mt-5 inline-block text-cyan-700 hover:text-cyan-900"
            to="/"
          >
            Back to role selection
          </Link>
        </article>
      </section>
    </main>
  );
};

export default DashboardShell;
