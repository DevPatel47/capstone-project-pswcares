import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We collect information you provide directly, such as your name, email address, phone number, and payment details when you create an account or make a booking.",
      "We may also automatically collect certain information when you use our platform, including IP address, browser type, device information, and usage patterns.",
      "If you are a PSW, we collect additional verification documents such as government-issued ID, professional certifications, and background check results.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide, maintain, and improve our platform and services.",
      "To process bookings, payments, and communicate with you about your account.",
      "To verify PSW credentials and ensure the safety of our community.",
      "To send you relevant notifications, updates, and promotional communications (with your consent).",
      "To comply with legal obligations and protect against fraudulent activity.",
    ],
  },
  {
    title: "3. Information Sharing",
    content: [
      "We do not sell your personal information to third parties.",
      "We may share information with service providers who assist us in operating our platform (e.g., payment processors, cloud hosting).",
      "Client information is shared with PSWs only as necessary to fulfill bookings, and vice versa.",
      "We may disclose information when required by law or to protect the rights and safety of our users.",
    ],
  },
  {
    title: "4. Data Security",
    content: [
      "We implement industry-standard security measures, including encryption, secure payment processing, and regular security audits.",
      "All payment transactions are processed through PCI-compliant payment gateways.",
      "While we strive to protect your data, no method of transmission over the internet is 100% secure.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "You have the right to access, correct, or delete your personal information at any time through your account settings.",
      "You may opt out of promotional communications by following the unsubscribe link in any email.",
      "You may request a copy of your data or ask us to restrict processing by contacting us at dev080405.canada@gmail.com.",
    ],
  },
  {
    title: "6. Cookies",
    content: [
      "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver relevant content.",
      "You can manage cookie preferences through your browser settings.",
    ],
  },
  {
    title: "7. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform.",
      "Your continued use of PSWCares after changes are posted constitutes acceptance of the revised policy.",
    ],
  },
  {
    title: "8. Contact Us",
    content: [
      "If you have questions about this Privacy Policy or our data practices, please contact us at dev080405.canada@gmail.com or through our Contact page.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-max section-padding !pt-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mb-10">Last updated: March 25, 2026</p>

            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed mb-10">
                At PSWCares, we are committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, and safeguard your information when you use our platform.
              </p>

              <div className="space-y-10">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                          <span className="text-slate-600 leading-relaxed">{item}</span>
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
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
