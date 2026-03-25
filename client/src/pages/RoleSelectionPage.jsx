import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";

const roleCards = [
  {
    role: "client",
    title: "I need care",
    description: "Find verified PSWs, request care support, and manage appointments with confidence.",
    registerPath: "/register?role=client",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    gradient: "from-brand-400 to-brand-600",
  },
  {
    role: "psw",
    title: "I provide care",
    description: "Create your profile, upload certifications, and connect with clients needing care.",
    registerPath: "/register?role=psw",
    icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
    gradient: "from-accent-400 to-accent-600",
  },
];

const RoleSelectionPage = () => {
  return (
    <main className="app-bg">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center p-6 md:p-10">
        <PageTransition>
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PSWCares</span>
          </Link>

          <div className="mb-10 max-w-2xl">
            <p className="page-label">Get Started</p>
            <h1 className="page-title !text-4xl md:!text-5xl !leading-tight">
              Choose how you want to continue
            </h1>
            <p className="page-subtitle !text-base md:!text-lg mt-4">
              Start with the right account path and complete registration in a few steps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {roleCards.map((card) => (
              <article
                key={card.role}
                className="app-card-hover group !p-0 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
                <div className="p-6 md:p-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">{card.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link className="btn-primary btn-sm" to={card.registerPath}>
                      Create account
                    </Link>
                    <Link className="btn-outline btn-sm" to="/login">
                      Sign in
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PageTransition>
      </section>
    </main>
  );
};

export default RoleSelectionPage;
