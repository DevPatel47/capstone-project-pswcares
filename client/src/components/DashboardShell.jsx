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
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.18),transparent_35%)] text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                PSWCares Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
              <p className="mt-1 text-slate-300">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-300">{session?.user?.email}</p>
              <button
                className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200 backdrop-blur">
          <p>
            Authentication UI is active. You are logged in as
            <span className="ml-2 rounded bg-cyan-400/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              {session?.user?.role}
            </span>
            .
          </p>
          <p className="mt-3 text-sm text-slate-300">
            This is a starter dashboard placeholder for role-based redirects.
          </p>
          <Link
            className="mt-5 inline-block text-cyan-200 hover:text-cyan-100"
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
