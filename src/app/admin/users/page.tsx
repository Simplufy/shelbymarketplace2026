"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, MoreHorizontal, Mail,
  CheckCircle, User, Download, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/database.types";

interface UserWithListings extends Profile {
  listings_count: number;
  status: 'active' | 'pending' | 'suspended';
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserWithListings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  
  const supabase = useMemo(() => createClient(), []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get listing counts for each user
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("user_id, id");

      if (listingsError) throw listingsError;

      // Count listings per user
      const listingCounts: Record<string, number> = {};
      listings?.forEach(listing => {
        listingCounts[listing.user_id] = (listingCounts[listing.user_id] || 0) + 1;
      });

      // Combine data
      const usersWithCounts = (profiles || []).map(profile => ({
        ...profile,
        listings_count: listingCounts[profile.id] || 0,
        // Mock status for now - can add status field to profiles later
        status: "active" as const
      }));

      setUsers(usersWithCounts);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: 'BUYER' | 'SELLER' | 'DEALER' | 'ADMIN') => {
    const previousUsers = users;
    try {
      setUpdatingRoleUserId(userId);
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, role: newRole } : user));

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update user role");
      }

      await loadUsers();
    } catch (error: any) {
      setUsers(previousUsers);
      console.error("Error updating user role:", error);
      alert(error.message || "Failed to update user role");
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-[#E31837] text-white";
      case "DEALER": return "bg-[#002D72] text-white";
      case "SELLER": return "bg-[#E31837]/10 text-[#E31837]";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "suspended": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Location", "Listings", "Joined"];
    const rows = filteredUsers.map(u => [
      `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      u.email,
      u.role,
      u.location || '',
      u.listings_count,
      formatDate(u.created_at)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Users</h1>
          <p className="text-gray-500">Manage user accounts, roles, and permissions.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: users.length, color: "blue" },
          { label: "Active", value: users.filter(u => u.status === "active").length, color: "green" },
          { label: "Dealers", value: users.filter(u => u.role === "DEALER").length, color: "blue" },
          { label: "Admins", value: users.filter(u => u.role === "ADMIN").length, color: "red" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className={`text-2xl font-black ${
              stat.color === "blue" ? "text-[#002D72]" :
              stat.color === "green" ? "text-green-600" :
              stat.color === "yellow" ? "text-yellow-600" :
              "text-[#E31837]"
            }`}>{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="dealer">Dealer</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedUsers.length} selected</span>
            <button className="px-4 py-2 bg-[#002D72] text-white font-medium rounded-lg hover:bg-[#001D4A] transition-colors text-sm">
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Listings</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelection(user.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="" width={40} height={40} unoptimized className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">
                          {user.first_name} {user.last_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{user.location || "No location"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                    disabled={updatingRoleUserId === user.id}
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border-0 cursor-pointer disabled:cursor-wait disabled:opacity-60 ${getRoleColor(user.role)}`}
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                    <option value="DEALER">Dealer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(user.status)}`}>
                    {user.status === "active" && <CheckCircle className="w-3 h-3" />}
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{user.listings_count}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
