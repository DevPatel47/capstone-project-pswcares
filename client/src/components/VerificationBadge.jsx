const badgeByStatus = {
  approved: {
    label: "Verified",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Pending Verification",
    classes: "border-amber-200 bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Verification Rejected",
    classes: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const VerificationBadge = ({ status }) => {
  const value = badgeByStatus[status] || {
    label: "Unknown Status",
    classes: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${value.classes}`}
    >
      {value.label}
    </span>
  );
};

export default VerificationBadge;
