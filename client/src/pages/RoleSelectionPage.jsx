import { Link } from "react-router-dom";

const roleCards = [
  {
    role: "client",
    title: "I am a Client",
    description:
      "Find verified PSWs, request care support, and manage appointments with confidence.",
    registerPath: "/register?role=client",
  },
  {
    role: "psw",
    title: "I am a PSW",
    description:
      "Create your profile, upload certifications, and connect with clients needing care.",
    registerPath: "/register?role=psw",
  },
];

const RoleSelectionPage = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center p-6 md:p-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-700">
            PSWCares
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Choose how you want to continue
          </h1>
          <p className="mt-4 text-base text-slate-700 md:text-lg">
            Start with the right account path and complete secure authentication
            in a few steps.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {roleCards.map((card) => (
            <article
              key={card.role}
              className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]"
            >
              <h2 className="text-2xl font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-3 min-h-16 text-slate-600">{card.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
                  to={card.registerPath}
                >
                  Create account
                </Link>
                <Link
                  className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50"
                  to="/login"
                >
                  I already have an account
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default RoleSelectionPage;
