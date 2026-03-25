const LoadingState = ({ label = "Loading...", compact = false }) => {
  return (
    <div className={`flex items-center gap-3 ${compact ? "py-2" : "justify-center py-12"}`}>
      <div className="relative h-5 w-5">
        <div className="absolute inset-0 rounded-full border-2 border-brand-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-500" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};

export default LoadingState;
