const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By creating an account or using the PSWCares platform, you agree to be bound by these Terms of Service and our Privacy Policy.",
      "If you do not agree to these terms, you may not access or use the platform.",
      "We reserve the right to modify these terms at any time. Continued use after modifications constitutes acceptance.",
    ],
  },
  {
    title: "2. User Accounts",
    content: [
      "You must be at least 18 years old to create an account on PSWCares.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
      "You agree to provide accurate, current, and complete information during registration and to update it as needed.",
      "PSWCares reserves the right to suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "3. PSW Verification",
    content: [
      "Personal Support Workers must complete our verification process, including identity verification, credential validation, and background screening.",
      "PSWCares does not guarantee the accuracy of all PSW-provided information but takes reasonable steps to verify credentials.",
      "PSWs are required to maintain valid certifications and insurance as applicable.",
    ],
  },
  {
    title: "4. Bookings & Payments",
    content: [
      "All bookings are made through the PSWCares platform and are subject to PSW availability.",
      "Clients agree to pay the listed rates for booked services. Payments are processed securely through our platform.",
      "Cancellation policies apply to all bookings. Specific cancellation terms are displayed at the time of booking.",
      "PSWCares charges a service fee on transactions, as disclosed during the booking process.",
    ],
  },
  {
    title: "5. User Conduct",
    content: [
      "Users must treat all other users with respect and professionalism.",
      "Harassment, discrimination, fraud, or any unlawful activity is strictly prohibited.",
      "Users may not misrepresent their identity, qualifications, or the nature of services offered.",
      "PSWCares reserves the right to remove content or suspend users who violate conduct standards.",
    ],
  },
  {
    title: "6. Reviews & Ratings",
    content: [
      "Clients may leave reviews and ratings for PSWs after completed bookings.",
      "Reviews must be honest, respectful, and based on genuine experiences.",
      "PSWCares reserves the right to remove reviews that violate our guidelines or contain inappropriate content.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    content: [
      "PSWCares serves as a platform connecting clients with PSWs. We are not an employer of PSWs and do not directly provide care services.",
      "PSWCares is not liable for the quality of services provided by PSWs or for any disputes between users.",
      "Our total liability to you shall not exceed the amounts you have paid through the platform in the preceding 12 months.",
    ],
  },
  {
    title: "8. Dispute Resolution",
    content: [
      "Users are encouraged to resolve disputes directly. PSWCares provides a dispute resolution process for unresolved issues.",
      "PSWCares may mediate disputes but is not obligated to resolve them in any particular manner.",
      "These terms are governed by the laws of the Province of Ontario, Canada.",
    ],
  },
  {
    title: "9. Contact",
    content: [
      "For questions about these Terms of Service, please contact us at dev080405.canada@gmail.com or through our Contact page.",
    ],
  },
];

const TermsOfServicePage = () => {
  return (
    <main className="py-16">
      <div className="container-max section-padding !py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 mb-10">
            Last updated: March 25, 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-10">
              Welcome to PSWCares. These Terms of Service govern your use of our
              platform and the services provided through it. Please read them
              carefully.
            </p>

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                        <span className="text-slate-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsOfServicePage;
