import Badge from "./ui/Badge";

const statusMap = {
  verified: { variant: "success", label: "Verified" },
  pending: { variant: "warning", label: "Pending" },
  rejected: { variant: "danger", label: "Rejected" },
  not_submitted: { variant: "neutral", label: "Not Submitted" },
};

const VerificationBadge = ({ status }) => {
  const config = statusMap[status] || statusMap.not_submitted;

  return (
    <Badge variant={config.variant}>
      {status === "verified" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {config.label}
    </Badge>
  );
};

export default VerificationBadge;
