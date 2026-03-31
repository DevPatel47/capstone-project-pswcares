const tabs = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "availability", label: "Availability" },
  { id: "certificates", label: "Certificates" },
  { id: "reviews", label: "Reviews" },
];

const ProfileTabs = ({ activeTab, onChange }) => {
  return (
    <nav className="app-card !p-1.5">
      <ul className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProfileTabs;
