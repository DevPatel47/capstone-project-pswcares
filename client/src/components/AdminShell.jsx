import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../services/authStorage";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/verify", label: "Verification Queue" },
  { to: "/admin/disputes", label: "Dispute Handling" },
  { to: "/admin/contacts", label: "Contact Messages" },
];

const AdminShell = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-10">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSWCares Admin
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

        <nav className="rounded-2xl border border-cyan-100 bg-white p-3 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <ul className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <li key={item.to}>
                  <Link
                    className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-700 text-white"
                        : "bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
                    }`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          {children}
        </section>
      </section>
    </main>
  );
};

export default AdminShell;
