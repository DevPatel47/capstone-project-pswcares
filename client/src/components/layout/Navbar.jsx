import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import {
  clearAuthSession,
  getAuthSession,
  getDashboardPathByRole,
} from "../../services/authStorage";
import {
  PUBLIC_NAV_LINKS,
  getMessagesPathByRole,
  getProfilePathByRole,
  getRoleNavbarLinks,
} from "./navConfig";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors duration-200 ${
    isActive ? "text-brand-700" : "text-slate-600 hover:text-brand-600"
  }`;

const AppNavbar = ({
  simplified = false,
  withSidebar = false,
  onOpenSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const session = getAuthSession();
  const role = session?.user?.role;
  const isAuthenticated = Boolean(session?.token && session?.user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnClickAway = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnClickAway);
    return () => document.removeEventListener("mousedown", closeOnClickAway);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const centerLinks = isAuthenticated
    ? getRoleNavbarLinks(role)
    : PUBLIC_NAV_LINKS;
  const dashboardPath = getDashboardPathByRole(role);
  const messagesPath = getMessagesPathByRole(role);
  const profilePath = getProfilePathByRole(role);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
          : "border-transparent bg-white/70 backdrop-blur-lg"
      }`}
    >
      <div className="container-max flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          {withSidebar ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Open dashboard navigation"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5"
                />
              </svg>
            </button>
          ) : null}

          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-105">
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
            <span className="text-lg font-bold tracking-tight text-brand-900">
              PSW<span className="text-brand-600">Cares</span>
            </span>
          </Link>
        </div>

        {!simplified ? (
          <nav className="hidden items-center gap-7 md:flex">
            {centerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end={link.exact !== false}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary !px-5 !py-2.5 !text-sm"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={dashboardPath}
                className="px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
              >
                Dashboard
              </Link>
              <Link
                to={messagesPath}
                className="px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
              >
                Messages
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-brand-50"
                  aria-expanded={menuOpen}
                  aria-label="Open user menu"
                >
                  <Avatar
                    name={session?.user?.name || session?.user?.email || "User"}
                    size="sm"
                  />
                  <svg
                    className="h-4 w-4 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-card"
                    >
                      <Link
                        to={profilePath}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="md:hidden relative h-10 w-10 rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`absolute left-2.5 top-3.5 h-0.5 w-5 bg-current transition-all ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`}
          />
          <span
            className={`absolute left-2.5 top-5 h-0.5 w-5 bg-current transition-opacity ${mobileOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`absolute left-2.5 top-6.5 h-0.5 w-5 bg-current transition-all ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {!simplified
                ? centerLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.exact !== false}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-700 hover:bg-slate-100"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))
                : null}

              <div className="my-2 border-t border-slate-100" />

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary mt-1 block text-center"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={dashboardPath}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={messagesPath}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Messages
                  </Link>
                  <Link
                    to={profilePath}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default AppNavbar;
