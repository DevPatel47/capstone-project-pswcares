import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../services/authStorage";
import PageTransition from "./ui/PageTransition";
import Avatar from "./ui/Avatar";

const CLIENT_NAV = [
  { to: "/client/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { to: "/client/psw-search", label: "Find PSWs", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { to: "/client/chat", label: "Messages", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  { to: "/client/disputes", label: "Disputes", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
];

const PSW_NAV = [
  { to: "/psw/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { to: "/psw/profile", label: "My Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { to: "/psw/chat", label: "Messages", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
];

const DashboardShell = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAuthSession();
  const role = session?.user?.role;
  const navItems = role === "psw" ? PSW_NAV : CLIENT_NAV;

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
              <p className="page-label">PSWCares</p>
              <h1 className="page-title">{title}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name={session?.user?.name || session?.user?.email || ""} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
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
            {navItems.map((item) => {
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

export default DashboardShell;
