import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <main className="py-16">
      <div className="container-max section-padding !py-8">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
            About Us
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight text-balance">
            Making Quality Care{" "}
            <span className="gradient-text">Accessible</span> for Everyone
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            PSWCares was founded with a simple mission: to bridge the gap
            between families seeking reliable in-home care and verified Personal
            Support Workers looking to grow their practice.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-brand-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To empower families with easy access to trusted, verified Personal
              Support Workers while providing PSWs with the tools and platform
              they need to build thriving, independent practices.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-accent-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Our Vision
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A world where every family can find compassionate, professional
              care for their loved ones with confidence, transparency, and peace
              of mind — all from the comfort of home.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Trust",
                desc: "Every PSW is background-checked and verified. We never compromise on safety.",
                icon: "🛡️",
              },
              {
                title: "Compassion",
                desc: "Care starts with empathy. We foster meaningful connections between clients and PSWs.",
                icon: "💙",
              },
              {
                title: "Transparency",
                desc: "No hidden fees, honest reviews, clear communication at every step.",
                icon: "✨",
              },
              {
                title: "Accessibility",
                desc: "Quality care should be available to everyone, regardless of location or circumstance.",
                icon: "🤝",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card text-center"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100 p-10 md:p-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Join the PSWCares community today and experience a better way to
            find — or provide — personal support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register?role=client" className="btn-primary">
              Find a PSW
            </Link>
            <Link to="/register?role=psw" className="btn-secondary">
              Become a PSW
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
