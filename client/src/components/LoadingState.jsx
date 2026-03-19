const LoadingState = ({ label = "Loading...", compact = false }) => {
  return (
    <div
      className={`flex items-center gap-2 text-slate-600 ${
        compact
          ? "text-sm"
          : "rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm"
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-cyan-700" />
      <span>{label}</span>
    </div>
  );
};

export default LoadingState;
