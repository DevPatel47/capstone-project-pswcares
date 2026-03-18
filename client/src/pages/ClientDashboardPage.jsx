import DashboardShell from "../components/DashboardShell";
import { Link } from "react-router-dom";

const ClientDashboardPage = () => {
  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Browse verified PSWs, manage bookings, and track appointment updates."
    >
      <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Marketplace</h3>
        <p className="mt-1 text-sm text-slate-700">
          View a PSW profile with tabs for services, certificates, and reviews.
        </p>
        <Link
          className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          to="/client/psw-profiles/demo-approved"
        >
          View Demo PSW Profile
        </Link>
      </div>
    </DashboardShell>
  );
};

export default ClientDashboardPage;
