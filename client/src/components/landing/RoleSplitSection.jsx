import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";

const roles = [
  {
    title: "For Clients",
    subtitle: "Find the right care for your loved ones",
    benefits: [
      "Browse verified PSW profiles with real reviews",
      "Book flexible one-time or recurring visits",
      "Chat directly with your care provider",
      "Secure, transparent payment processing",
      "File and resolve disputes easily",
    ],
    cta: { label: "Find a PSW", to: "/register?role=client" },
    gradient: "from-brand-500 to-brand-600",
    borderColor: "border-brand-200",
    bgAccent: "bg-brand-50",
    checkColor: "text-brand-500",
  },
  {
    title: "For PSWs",
    subtitle: "Grow your practice your way",
    benefits: [
      "Create a professional profile and showcase skills",
      "Set your own rates and availability",
      "Get verified and build client trust",
      "Receive secure, on-time payments",
      "Connect with clients in your area",
    ],
    cta: { label: "Become a PSW", to: "/register?role=psw" },
    gradient: "from-accent-500 to-accent-600",
    borderColor: "border-accent-200",
    bgAccent: "bg-accent-50",
    checkColor: "text-accent-500",
  },
];

const RoleSplitSection = () => {
  return (
    <section className="section-padding bg-slate-50/50 relative">
      <div className="container-max">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              For Everyone
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-balance">
              Whether You Need Care or Provide It
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              PSWCares is designed for both sides of the care equation.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {roles.map((role, i) => (
            <AnimatedSection key={role.title} delay={0.15 * i} direction={i === 0 ? "left" : "right"}>
              <div className={`relative rounded-2xl border ${role.borderColor} bg-white p-8 md:p-10 shadow-card hover:shadow-card-hover transition-all duration-400 h-full group`}>
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${role.gradient}`} />

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{role.title}</h3>
                <p className="text-slate-600 mb-8">{role.subtitle}</p>

                <ul className="space-y-4 mb-10">
                  {role.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 ${role.checkColor} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={role.cta.to}
                  className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${role.gradient} px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg active:scale-[0.97]`}
                >
                  {role.cta.label}
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSplitSection;
