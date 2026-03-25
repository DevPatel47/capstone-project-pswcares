import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Client",
    rating: 5,
    review:
      "Finding a trusted PSW for my mother was so stressful until I found PSWCares. The verification process gave me peace of mind, and our PSW has been absolutely wonderful.",
    avatar: "S",
    color: "bg-brand-500",
  },
  {
    name: "James R.",
    role: "Personal Support Worker",
    rating: 5,
    review:
      "PSWCares has helped me build my client base and grow my practice. The platform is easy to use, payments are always on time, and I love being able to set my own schedule.",
    avatar: "J",
    color: "bg-accent-500",
  },
  {
    name: "Maria L.",
    role: "Client",
    rating: 5,
    review:
      "The real-time chat feature is a game changer. I can communicate with our PSW throughout the day to check on my father. The booking process is seamless too.",
    avatar: "M",
    color: "bg-teal-500",
  },
];

const StarRating = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(count)].map((_, i) => (
      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.174 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="section-padding bg-white relative">
      <div className="container-max">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-balance">
              Loved by Families & Caregivers
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Real stories from the PSWCares community.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={0.1 * (i + 1)}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1 h-full flex flex-col">
                {/* Quote icon */}
                <svg className="w-8 h-8 text-brand-200 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>

                <p className="text-slate-600 leading-relaxed flex-grow mb-6">
                  &ldquo;{t.review}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                  <div className="ml-auto">
                    <StarRating count={t.rating} />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
