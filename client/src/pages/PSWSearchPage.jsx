import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import VerificationBadge from "../components/VerificationBadge";
import Avatar from "../components/ui/Avatar";
import PageTransition from "../components/ui/PageTransition";
import EmptyState from "../components/ui/EmptyState";
import { searchPSWsRequest } from "../services/pswProfileApi";

const defaultFilters = {
  city: "",
  service: "",
  experience: "",
};

const PSWSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get("location") || defaultFilters.city,
    service: searchParams.get("service") || defaultFilters.service,
    experience: searchParams.get("experience") || defaultFilters.experience,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get("page") || 1),
    totalPages: 1,
    total: 0,
    limit: 9,
  });

  const loadPSWs = async (params) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await searchPSWsRequest({
        location: params.city || undefined,
        service: params.service || undefined,
        experience: params.experience || undefined,
        page: params.page || 1,
        limit: 9,
      });

      setResults(data.items || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 9,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to search PSWs.",
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      city: searchParams.get("location") || "",
      service: searchParams.get("service") || "",
      experience: searchParams.get("experience") || "",
      page: Number(searchParams.get("page") || 1),
    };

    setFilters({
      city: params.city,
      service: params.service,
      experience: params.experience,
    });

    loadPSWs(params);
  }, [searchParams]);

  const updateSearchParams = (nextFilters, page = 1) => {
    const next = {};
    if (nextFilters.city.trim()) next.location = nextFilters.city.trim();
    if (nextFilters.service.trim()) next.service = nextFilters.service.trim();
    if (nextFilters.experience.trim()) next.experience = nextFilters.experience.trim();
    if (page > 1) next.page = String(page);
    setSearchParams(next);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateSearchParams(filters, 1);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    updateSearchParams(filters, nextPage);
  };

  return (
    <main className="app-bg px-4 py-8">
      <PageTransition className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header + Search */}
        <header className="app-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="page-label">Marketplace</p>
              <h1 className="page-title">Find verified PSWs</h1>
              <p className="page-subtitle">Search trusted support workers by city, service, and experience.</p>
            </div>
            <Link className="btn-outline btn-sm" to="/client/dashboard">
              ← Dashboard
            </Link>
          </div>

          <form
            className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_auto_auto]"
            onSubmit={handleSearchSubmit}
          >
            <input
              className="app-input"
              name="city"
              onChange={handleFilterChange}
              placeholder="City (e.g. Toronto)"
              value={filters.city}
            />
            <input
              className="app-input"
              name="service"
              onChange={handleFilterChange}
              placeholder="Service (e.g. Elderly care)"
              value={filters.service}
            />
            <input
              className="app-input"
              min="0"
              name="experience"
              onChange={handleFilterChange}
              placeholder="Min years"
              type="number"
              value={filters.experience}
            />
            <button className="btn-primary btn-sm" type="submit">Search</button>
            <button className="btn-outline btn-sm" onClick={handleClear} type="button">Clear</button>
          </form>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        {/* Results info */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>{isLoading ? "Searching..." : `${pagination.total} verified PSW(s) found`}</p>
          <p>Page {pagination.page} of {pagination.totalPages}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="h-56 animate-pulse rounded-2xl border border-brand-100/60 bg-white" key={`sk-${i}`} />
              ))
            : null}

          {!isLoading && results.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No PSWs match this search"
                description="Try a different city, service, or lower the experience filter."
              />
            </div>
          ) : null}

          {!isLoading
            ? results.map((profile) => {
                const providerName = profile.userId?.name || "Verified PSW";
                return (
                  <article
                    className="flex h-full flex-col justify-between app-card-hover !p-0 overflow-hidden"
                    key={profile._id}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={providerName} size="md" />
                          <div>
                            <h2 className="text-base font-bold text-slate-900">{providerName}</h2>
                            <p className="text-xs text-slate-500">{profile.location}</p>
                          </div>
                        </div>
                        <VerificationBadge status={profile.verificationStatus} />
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {profile.bio || "No bio available."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(profile.services || []).slice(0, 3).map((service) => (
                          <span className="badge-info" key={`${profile._id}-${service}`}>
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-brand-100/60 p-4 bg-brand-50/20 flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span><span className="font-semibold text-slate-900">{profile.experience}</span> yrs exp</span>
                        <span><span className="font-semibold text-slate-900">${profile.hourlyRate}</span>/hr</span>
                      </div>
                      <Link
                        className="btn-primary btn-sm !px-4"
                        state={{ profile }}
                        to={`/client/psw-profiles/${profile._id}`}
                      >
                        View Profile
                      </Link>
                    </div>
                  </article>
                );
              })
            : null}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn-outline btn-sm"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => handlePageChange(pagination.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 px-3">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="btn-outline btn-sm"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => handlePageChange(pagination.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </PageTransition>
    </main>
  );
};

export default PSWSearchPage;
