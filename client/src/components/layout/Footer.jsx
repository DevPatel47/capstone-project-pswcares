import { Link } from "react-router-dom";
import { getAuthSession } from "../../services/authStorage";
import { getQuickDashboardPath } from "./navConfig";

const AppFooter = () => {
  const session = getAuthSession();
  const dashboardPath = getQuickDashboardPath(session);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-max px-5 pb-8 pt-16 sm:px-8 lg:px-12">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-400">
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
              <span className="text-lg font-bold tracking-tight text-white">
                PSW<span className="text-brand-400">Cares</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              PSWCares connects families with verified Personal Support Workers
              for dependable and compassionate in-home care.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/client/psw-search"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Find a PSW
                </Link>
              </li>
              <li>
                <Link
                  to={dashboardPath}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-white"
                >
                  Contact Page
                </Link>
              </li>
              <li>
                <a
                  href="mailto:dev080405.canada@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  dev080405.canada@gmail.com
                </a>
              </li>
              <li>Ontario, Canada</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} PSWCares. All rights reserved.
          </p>
          <p>Made with care in Canada</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
