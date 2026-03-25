import AnimatedSection from "./AnimatedSection";

const trustItems = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Verified Professionals",
    description: "Every PSW undergoes thorough background checks, credential verification, and identity confirmation.",
    color: "bg-brand-50 text-brand-600 border-brand-100",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Secure Payments",
    description: "All transactions are encrypted and processed through trusted payment gateways. Your data stays safe.",
    color: "bg-accent-50 text-accent-600 border-accent-100",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Real Reviews",
    description: "Read honest feedback from real clients. Our transparent review system helps you find the right match.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

const stats = [
  { value: "500+", label: "Verified PSWs" },
  { value: "1,000+", label: "Bookings Completed" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "98%", label: "Client Satisfaction" },
];

const TrustSection = () => {
  return (
    <section className="section-padding bg-white relative">
      <div className="container-max">
        {/* Stats bar */}
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Trust pillars */}
        <AnimatedSection delay={0.15}>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Why Choose Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-balance">
              Built on Trust & Transparency
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {trustItems.map((item, i) => (
            <AnimatedSection key={item.title} delay={0.1 * (i + 1)}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border ${item.color} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
