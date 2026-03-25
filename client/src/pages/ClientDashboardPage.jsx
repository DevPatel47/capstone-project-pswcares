import DashboardShell from "../components/DashboardShell";
import { Link } from "react-router-dom";

const widgets = [
  {
    title: "Find PSWs",
    description: "Search verified Personal Support Workers by city, service, and experience.",
    to: "/client/psw-search",
    cta: "Search PSWs",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    gradient: "from-brand-400 to-brand-600",
  },
  {
    title: "Messages",
    description: "Chat with your confirmed-booking PSWs in real time.",
    to: "/client/chat",
    cta: "Open Chat",
    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    gradient: "from-accent-400 to-accent-600",
  },
  {
    title: "Disputes",
    description: "Report issues with appointments and track their resolution status.",
    to: "/client/disputes",
    cta: "View Disputes",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    gradient: "from-amber-400 to-orange-500",
  },
];

const ClientDashboardPage = () => {
  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Browse verified PSWs, manage bookings, and track appointment updates."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((w) => (
          <div
            key={w.title}
            className="group rounded-xl border border-brand-100/60 bg-gradient-to-br from-white to-brand-50/30 p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${w.gradient} flex items-center justify-center mb-4`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={w.icon} />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{w.description}</p>
            <Link className="btn-primary btn-sm mt-4 w-full text-center" to={w.to}>
              {w.cta}
            </Link>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
};

export default ClientDashboardPage;
