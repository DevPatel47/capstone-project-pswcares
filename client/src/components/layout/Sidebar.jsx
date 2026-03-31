import { Link, useLocation } from "react-router-dom";
import { getRoleSidebarLinks } from "./navConfig";

const SidebarItems = ({ role, onSelect }) => {
  const location = useLocation();
  const items = getRoleSidebarLinks(role);

  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <li key={`${role}-${item.label}`}>
            <Link
              to={item.to}
              onClick={onSelect}
              className={`inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.icon}
                />
              </svg>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const AppSidebar = ({ role, mobile = false, onClose }) => {
  return (
    <aside
      className={
        mobile ? "app-card !p-4" : "app-card sticky top-[92px] h-fit !p-4"
      }
    >
      <p className="page-label mb-2">Navigation</p>
      <SidebarItems role={role} onSelect={onClose} />
    </aside>
  );
};

export default AppSidebar;
