import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getAdminUsers } from "../services/adminApi";

const ROLE_OPTIONS = ["all", "client", "psw", "admin"];

const roleBadge = (role) => {
  const map = { client: "info", psw: "success", admin: "warning" };
  return map[role] || "neutral";
};

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
      setError(requestError?.response?.data?.message || "Failed to load users.");
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
      <form className="mb-6 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <select className="app-select max-w-[180px]" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All roles" : option.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          className="app-input flex-1"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary btn-sm" type="submit">Search</button>
      </form>

      {loading ? <LoadingState label="Loading users..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-brand-100/40 transition hover:bg-brand-50/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name || ""} size="sm" />
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadge(user.role)}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{user.status || "active"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? (
            <EmptyState title="No users found" description="Try adjusting your filters or search query." />
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
};

export default AdminUsersPage;
