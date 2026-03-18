const tabConfig = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "certificates", label: "Certificates" },
  { id: "reviews", label: "Reviews" },
];

const ProfileTabs = ({ activeTab, onChange }) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-xl border border-cyan-100 bg-white p-2">
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-900"
              }`}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
