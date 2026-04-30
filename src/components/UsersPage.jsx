import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Users, Loader2, RefreshCw, ShieldCheck, Gift, Building2,
  BarChart3, UserCheck, Trash2, Pencil, X, Check,
} from "lucide-react";
import { getUsers, updateUser as dbUpdateUser, deleteUser as dbDeleteUser } from "@/lib/mock-db";

const ALL_ROLES = ["admin", "donor", "recipient", "analyst"];

const roleBadgeColors = {
  admin: "bg-primary/10 text-primary border-primary/30",
  donor: "bg-success/10 text-success border-success/30",
  recipient: "bg-accent/10 text-accent border-accent/30",
  analyst: "bg-info/10 text-info border-info/30",
};

const roleIcons = {
  admin: ShieldCheck,
  donor: Gift,
  recipient: Building2,
  analyst: BarChart3,
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [orgName, setOrgName] = useState(user.organization_name || "");
  const [role, setRole] = useState(user.role || "donor");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave({ ...user, full_name: fullName, organization_name: orgName, role });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-xl border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-foreground text-lg">Edit User</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold", roleBadgeColors[role])}>
              {(fullName || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{fullName || "Unnamed User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Organization</label>
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name (optional)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((r) => {
                const Icon = roleIcons[r];
                return (
                  <button key={r} onClick={() => setRole(r)}
                    className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                      role === r ? roleBadgeColors[r] + " border-current font-medium" : "hover:bg-muted/50")}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="capitalize">{r}</span>
                    {role === r && <Check className="h-3 w-3 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      onConfirm(user.user_id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-xl border">
        <div className="px-6 py-5 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mx-auto">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-foreground text-lg">Delete User</h3>
            <p className="text-sm text-muted-foreground">
              Remove <span className="font-medium text-foreground">{user.full_name || "this user"}</span>'s profile and role?
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">
              Their sign-in account will remain — only profile data and role will be deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UsersPage() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const load = async () => {
    setLoading(true);
    setUserList(getUsers());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const roleOptions = ["all", "admin", "donor", "recipient", "analyst"];

  const filtered = userList.filter((u) => {
    const matchSearch = !search ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.organization_name || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = roleOptions.slice(1).reduce((acc, r) => {
    acc[r] = userList.filter((u) => u.role === r).length;
    return acc;
  }, {});

  const handleSaved = (updated) => {
    dbUpdateUser(updated);
    setUserList((prev) => prev.map((u) => u.user_id === updated.user_id ? updated : u));
  };

  const handleDeleted = (userId) => {
    dbDeleteUser(userId);
    setUserList((prev) => prev.filter((u) => u.user_id !== userId));
  };

  return (
    <div className="space-y-8">
      {/* Modals */}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaved} />}
      {deletingUser && <DeleteConfirmModal user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={handleDeleted} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all registered users, roles, and profiles</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {roleOptions.slice(1).map((r) => {
          const Icon = roleIcons[r];
          return (
            <div key={r} className={cn("rounded-xl border p-4 cursor-pointer transition-all hover:shadow-soft", roleFilter === r ? roleBadgeColors[r] + " border-current" : "bg-card")} onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}>
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4" />
                <span className="text-2xl font-bold">{roleCounts[r]}</span>
              </div>
              <p className="mt-1 text-xs capitalize font-medium">{r}s</p>
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input type="text" placeholder="Search by name or organization…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              className="h-8 text-xs capitalize"
              onClick={() => setRoleFilter(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No users found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">
                {filtered.length} User{filtered.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">{userList.length} total registered</span>
          </div>
          <div className="divide-y">
            {filtered.map((u) => {
              const Icon = u.role ? roleIcons[u.role] : Users;
              return (
                <div key={u.user_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold", u.role ? roleBadgeColors[u.role] : "bg-muted text-muted-foreground")}>
                      {(u.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Unnamed User"}</p>
                      {u.organization_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />{u.organization_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Right: role badge + date + action buttons */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {u.role && (
                      <Badge variant="outline" className={cn("text-xs capitalize hidden sm:inline-flex items-center gap-1", roleBadgeColors[u.role])}>
                        <Icon className="h-3 w-3" />{u.role}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground hidden md:block whitespace-nowrap">
                      {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : ""}
                    </span>
                    {/* Edit */}
                    <button onClick={() => setEditingUser(u)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      title="Edit user">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {/* Delete */}
                    <button onClick={() => setDeletingUser(u)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors"
                      title="Delete user">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
