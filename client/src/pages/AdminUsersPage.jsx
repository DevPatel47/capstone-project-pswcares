import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { getAdminUsers } from "../services/adminApi";

const ROLE_OPTIONS = ["all", "client", "psw", "admin"];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers({
        role: role === "all" ? undefined : role,
        search: search.trim() || undefined,
        limit: 50,
      });
      setUsers(data.items || []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadUsers();
  };

  return (
    <AdminShell
      title="User Management"
      subtitle="Review platform users by role and quickly audit account details."
    >
      <form
        className="mb-5 flex flex-col gap-3 md:flex-row"
        onSubmit={handleSubmit}
      >
        <select
          className="rounded-lg border border-cyan-200 px-3 py-2 text-sm"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All roles" : option.toUpperCase()}
            </option>
          ))}
        </select>

        <input
          className="flex-1 rounded-lg border border-cyan-200 px-3 py-2 text-sm"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
          type="submit"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading users...</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="rounded-xl bg-cyan-50/60 text-slate-700"
                >
                  <td className="px-3 py-3 font-medium">{user.name}</td>
                  <td className="px-3 py-3">{user.email}</td>
                  <td className="px-3 py-3 uppercase">{user.role}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase text-cyan-800">
                      {user.status || "active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500">No users found.</p>
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
};

export default AdminUsersPage;
