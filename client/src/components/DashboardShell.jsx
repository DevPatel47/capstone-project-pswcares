import { getAuthSession } from "../services/authStorage";
import PageTransition from "./ui/PageTransition";

const DashboardShell = ({ title, subtitle, children }) => {
  const session = getAuthSession();

  return (
    <section className="space-y-4">
      <header className="app-card">
        <p className="page-label">PSWCares</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
        {session?.user?.email ? (
          <p className="mt-3 text-xs text-slate-500">
            Signed in as {session.user.email}
          </p>
        ) : null}
      </header>
      <PageTransition>
        <section className="app-card">{children}</section>
      </PageTransition>
    </section>
  );
};

export default DashboardShell;
