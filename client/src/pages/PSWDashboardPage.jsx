import DashboardShell from "../components/DashboardShell";
import { Link } from "react-router-dom";

const PSWDashboardPage = () => {
  return (
    <DashboardShell
      title="PSW Dashboard"
      subtitle="Manage service requests, availability, and client communication from one place."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Profile Setup
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Complete your PSW profile, upload certificates, and submit for
            verification.
          </p>
          <Link
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/psw/profile"
          >
            Edit My Profile
          </Link>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Messages</h3>
          <p className="mt-1 text-sm text-slate-700">
            Reply to clients with confirmed appointments in real time.
          </p>
          <Link
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/psw/chat"
          >
            Open Chat
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
};

export default PSWDashboardPage;
