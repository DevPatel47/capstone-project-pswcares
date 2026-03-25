import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../services/authStorage";
import PageTransition from "./ui/PageTransition";
import Avatar from "./ui/Avatar";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Overview", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
  { to: "/admin/users", label: "Users", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
  { to: "/admin/verify", label: "Verification", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" },
  { to: "/admin/disputes", label: "Disputes", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
  { to: "/admin/contacts", label: "Messages", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
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
    <main className="app-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <header className="app-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="page-label">Admin Panel</p>
              <h1 className="page-title">{title}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name={session?.user?.name || "Admin"} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
              <button
                className="btn-outline btn-sm"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="app-card !p-2">
          <ul className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                        : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                    }`}
                    to={item.to}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <PageTransition>
          <section className="app-card">
            {children}
          </section>
        </PageTransition>
      </section>
    </main>
  );
};

export default AdminShell;
