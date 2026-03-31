const sections = [
  {
    title: "Our Commitment",
    content:
      "PSWCares is committed to ensuring digital accessibility for people of all abilities. We continually improve the user experience for everyone and apply the relevant accessibility standards to ensure we provide equal access to all users.",
  },
  {
    title: "Standards",
    content:
      "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.",
  },
  {
    title: "Measures We Take",
    items: [
      "Semantic HTML structure for screen reader compatibility",
      "Keyboard navigable interface throughout the platform",
      "Sufficient color contrast ratios for text and interactive elements",
      "Descriptive alt text for all meaningful images",
      "Clearly labeled form inputs and interactive controls",
      "Focus indicators on all interactive elements",
      "Responsive design that supports browser zoom up to 200%",
      "ARIA attributes where native HTML semantics are insufficient",
    ],
  },
  {
    title: "Assistive Technologies",
    content:
      "PSWCares is designed to be compatible with common assistive technologies including screen readers (NVDA, JAWS, VoiceOver), screen magnifiers, speech recognition software, and alternative input devices.",
  },
  {
    title: "Known Limitations",
    content:
      "While we strive for full accessibility, some areas of our platform may not yet be fully optimized. We are actively working to identify and resolve any accessibility barriers. If you encounter an issue, please let us know.",
  },
  {
    title: "Feedback",
    content:
      "We welcome your feedback on the accessibility of PSWCares. If you encounter any barriers or have suggestions for improvement, please contact us at dev080405.canada@gmail.com or through our Contact page. We aim to respond to feedback within 2 business days.",
  },
];

const AccessibilityPage = () => {
  return (
    <main className="py-16">
      <div className="container-max section-padding !py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
            Commitment
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Accessibility
          </h1>
          <p className="text-sm text-slate-500 mb-10">
            Last updated: March 25, 2026
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-slate-600 leading-relaxed">
                    {section.content}
                  </p>
                )}
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 text-brand-500 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        <span className="text-slate-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccessibilityPage;
