const variantMap = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  neutral: "badge-neutral",
};

const Badge = ({ children, variant = "info", className = "" }) => {
  return (
    <span className={`${variantMap[variant] || variantMap.info} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
