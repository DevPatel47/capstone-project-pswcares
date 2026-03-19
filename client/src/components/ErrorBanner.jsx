const ErrorBanner = ({ message, compact = false }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-rose-200 bg-rose-50 text-rose-700 ${
        compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm"
      }`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default ErrorBanner;
