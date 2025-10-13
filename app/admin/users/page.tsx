"use client";

import { useEffect, useState } from "react";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string, role: string) {
    if (role === "admin") {
      alert("You cannot delete an admin user.");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== id));
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  async function changeRole(id: string, newRole: string) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id
              ? {
                  ...u,
                  role: newRole,
                }
              : u
          )
        );
      } else {
        console.error("Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 mb-4 p-2 rounded bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-400 mt-4">No users found.</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-700 hover:bg-gray-700/40 transition"
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-semibold">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    {user.name || "Unknown"}
                  </td>
                  <td className="px-4 py-2">{user.email}</td>

                  {/* Role Dropdown */}
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user._id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === "admin"
                          ? "bg-purple-600/30 text-purple-300"
                          : "bg-blue-600/30 text-blue-300"
                      }`}
                    >
                      <option value="user" className="text-gray-900">
                        user
                      </option>
                      <option value="admin" className="text-gray-900">
                        admin
                      </option>
                    </select>
                  </td>

                  {/* Delete Button */}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteUser(user._id, user.role)}
                      disabled={user.role === "admin"}
                      className={`px-3 py-1 rounded ${
                        user.role === "admin"
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
