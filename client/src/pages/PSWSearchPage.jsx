import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import VerificationBadge from "../components/VerificationBadge";
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

    if (nextFilters.city.trim()) {
      next.location = nextFilters.city.trim();
    }

    if (nextFilters.service.trim()) {
      next.service = nextFilters.service.trim();
    }

    if (nextFilters.experience.trim()) {
      next.experience = nextFilters.experience.trim();
    }

    if (page > 1) {
      next.page = String(page);
    }

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
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    updateSearchParams(filters, nextPage);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSWCares Marketplace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Find verified PSWs
              </h1>
              <p className="mt-1 text-slate-600">
                Search trusted support workers by city, service, and experience.
              </p>
            </div>
            <Link
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
              to="/client/dashboard"
            >
              Back to dashboard
            </Link>
          </div>

          <form
            className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto_auto]"
            onSubmit={handleSearchSubmit}
          >
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
              name="city"
              onChange={handleFilterChange}
              placeholder="City (e.g. Toronto)"
              value={filters.city}
            />
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
              name="service"
              onChange={handleFilterChange}
              placeholder="Service (e.g. Elderly care)"
              value={filters.service}
            />
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
              min="0"
              name="experience"
              onChange={handleFilterChange}
              placeholder="Min years"
              type="number"
              value={filters.experience}
            />
            <button
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
              type="submit"
            >
              Search
            </button>
            <button
              className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
              onClick={handleClear}
              type="button"
            >
              Clear
            </button>
          </form>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>
            {isLoading
              ? "Searching..."
              : `${pagination.total} verified PSW(s) found`}
          </p>
          <p>
            Page {pagination.page} of {pagination.totalPages}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <article
                  className="h-52 animate-pulse rounded-2xl border border-cyan-100 bg-white"
                  key={`skeleton-${index}`}
                />
              ))
            : null}

          {!isLoading && results.length === 0 ? (
            <article className="col-span-full rounded-2xl border border-cyan-100 bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                No PSWs match this search
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Try a different city, service, or lower experience filter.
              </p>
            </article>
          ) : null}

          {!isLoading
            ? results.map((item) => {
                const profile = item;
                const providerName = profile.userId?.name || "Verified PSW";

                return (
                  <article
                    className="flex h-full flex-col justify-between rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_20px_40px_-35px_rgba(6,182,212,0.45)]"
                    key={profile._id}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {providerName}
                        </h2>
                        <VerificationBadge
                          status={profile.verificationStatus}
                        />
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
                        {profile.bio || "No bio available."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(profile.services || []).slice(0, 3).map((service) => (
                          <span
                            className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800"
                            key={`${profile._id}-${service}`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">
                          City:
                        </span>{" "}
                        {profile.location}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Experience:
                        </span>{" "}
                        {profile.experience} years
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Rate:
                        </span>{" "}
                        ${profile.hourlyRate}/hr
                      </p>
                      <Link
                        className="mt-2 inline-block w-full rounded-lg bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
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

        <div className="flex items-center justify-center gap-2">
          <button
            className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => handlePageChange(pagination.page - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => handlePageChange(pagination.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
};

export default PSWSearchPage;
