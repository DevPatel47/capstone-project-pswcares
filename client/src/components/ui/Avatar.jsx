const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const Avatar = ({ name = "", size = "md", className = "" }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeMap[size] || sizeMap.md} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-400 font-semibold text-white ${className}`}
    >
      {initials || "?"}
    </div>
  );
};

export default Avatar;
