import DashboardShell from "../components/DashboardShell";
import { Link } from "react-router-dom";

const ClientDashboardPage = () => {
  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Browse verified PSWs, manage bookings, and track appointment updates."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Marketplace</h3>
          <p className="mt-1 text-sm text-slate-700">
            Search verified PSWs by city, service, and experience.
          </p>
          <Link
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/client/psw-search"
          >
            Search PSWs
          </Link>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Messages</h3>
          <p className="mt-1 text-sm text-slate-700">
            Chat with your confirmed-booking PSWs in real time.
          </p>
          <Link
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/client/chat"
          >
            Open Chat
          </Link>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Disputes</h3>
          <p className="mt-1 text-sm text-slate-700">
            Report issues with appointments and track their status.
          </p>
          <Link
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/client/disputes"
          >
            Open Disputes
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ClientDashboardPage;
