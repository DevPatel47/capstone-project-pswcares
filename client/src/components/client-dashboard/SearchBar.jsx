const SearchBar = ({
  query,
  service,
  onQueryChange,
  onServiceChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <form
      className="rounded-2xl border border-brand-100/70 bg-white p-3 sm:p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div>
          <label className="app-label" htmlFor="discover-query">
            Location or service
          </label>
          <input
            className="app-input"
            id="discover-query"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try Toronto, mobility support, overnight care"
            value={query}
          />
        </div>

        <div>
          <label className="app-label" htmlFor="discover-service">
            Quick filter
          </label>
          <select
            className="app-select"
            id="discover-service"
            onChange={(event) => onServiceChange(event.target.value)}
            value={service}
          >
            <option value="">All services</option>
            <option value="Elder care">Elder care</option>
            <option value="Disability support">Disability support</option>
            <option value="Post-surgery care">Post-surgery care</option>
          </select>
        </div>

        <button
          className="btn-primary h-fit self-end"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
