const ErrorBanner = ({ message, compact = false }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-rose-200 bg-rose-50 text-rose-700 ${
        compact ? "px-4 py-2.5 text-sm" : "px-5 py-4 text-sm"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ErrorBanner;
