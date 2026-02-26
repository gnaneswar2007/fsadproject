import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { ListDonationDialog } from "@/components/ListDonationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Gift, Package, TrendingDown, Users,
  BarChart3, ShieldCheck, ClipboardList,
  CheckCircle2, Clock, Loader2, MapPin, CalendarIcon, Trash2,
  RefreshCw, HandHeart,
} from "lucide-react";
import { format } from "date-fns";
import {
  getDonations, getDonationsByUser, getAvailableDonations,
  deleteDonation, updateDonationStatus, getUsers,
} from "@/lib/mock-db";

// ─── Shared helpers ──────────────────────────────────────────────────────────
const donationStatusColors = {
  available: "bg-success/10 text-success border-success/30",
  claimed: "bg-info/10 text-info border-info/30",
  picked_up: "bg-primary/10 text-primary border-primary/30",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, color = "text-primary" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
      <div className="mb-3 rounded-xl bg-muted p-3">
        <Icon className={cn("h-7 w-7", color)} />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, claimed: 0, users: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const allDonations = getDonations();
    const allUsers = getUsers();
    setStats({
      total: allDonations.length,
      available: allDonations.filter((d) => d.status === "available").length,
      claimed: allDonations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length,
      users: allUsers.length,
    });
    setRecentDonations(allDonations.slice().reverse());
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform-wide overview and management</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Donations" value={String(stats.total)} subtitle="All time" icon={Gift} variant="primary" trend={{ value: `${stats.available} available`, positive: true }} onClick={() => navigate("/dashboard/donations")} />
            <StatCard title="Active Listings" value={String(stats.available)} subtitle="Available now" icon={Package} variant="secondary" onClick={() => navigate("/dashboard/active-listings")} />
            <StatCard title="Claims Made" value={String(stats.claimed)} subtitle="Claimed or picked" icon={CheckCircle2} variant="accent" onClick={() => navigate("/dashboard/success-rate")} />
            <StatCard title="Registered Users" value={String(stats.users)} subtitle="On platform" icon={Users} onClick={() => navigate("/dashboard/users")} />
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />All Donations
              </h2>
              <span className="text-xs text-muted-foreground">{stats.total} total</span>
            </div>
            {recentDonations.length === 0 ? (
              <EmptyState icon={Gift} title="No donations yet" subtitle="Donations will appear here once donors list food." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Food Item</th>
                      <th className="pb-2 pr-4 font-medium">Category</th>
                      <th className="pb-2 pr-4 font-medium">Qty</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30">
                        <td className="py-2.5 pr-4 font-medium text-foreground">{d.food_name}</td>
                        <td className="py-2.5 pr-4 capitalize text-muted-foreground">{d.category}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{d.quantity}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="outline" className={cn("text-xs capitalize", donationStatusColors[d.status])}>
                            {d.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {d.expiry_date ? format(new Date(d.expiry_date), "MMM d") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Registered Users</h2>
            </div>
            {users.length === 0 ? (
              <EmptyState icon={Users} title="No users yet" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {users.map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.full_name || "Unknown"}</p>
                      {u.organization_name && <p className="text-xs text-muted-foreground">{u.organization_name}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Donor Dashboard ─────────────────────────────────────────────────────────
function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDonations = async () => {
    if (!user) return;
    setLoading(true);
    setDonations(getDonationsByUser(user.id));
    setLoading(false);
  };

  useEffect(() => { fetchDonations(); }, [user]);

  const handleDelete = async (id) => {
    deleteDonation(id);
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  const total = donations.length;
  const claimed = donations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length;
  const available = donations.filter((d) => d.status === "available").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Donor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your food donations and track impact</p>
        </div>
        <ListDonationDialog onSuccess={fetchDonations} triggerLabel="List Surplus Food" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Donations" value={String(total)} subtitle="Total listed" icon={Gift} variant="primary" onClick={() => navigate("/dashboard/donations")} />
        <StatCard title="Active Listings" value={String(available)} subtitle="Available now" icon={Package} variant="secondary" onClick={() => navigate("/dashboard/donations")} />
        <StatCard title="Claims Made" value={String(claimed)} subtitle="By organizations" icon={CheckCircle2} variant="accent" onClick={() => navigate("/dashboard/donations")} />
        <StatCard title="Waste Avoided" value={total > 0 ? `~${Math.round(total * 2.3)} kg` : "—"} subtitle="Est. food saved" icon={TrendingDown} onClick={() => navigate("/dashboard/waste-avoided")} />
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-success" />
            <h2 className="text-lg font-semibold text-foreground">My Listings</h2>
          </div>
          <ListDonationDialog onSuccess={fetchDonations} triggerLabel="New Donation" triggerVariant="outline" />
        </div>

        {loading ? <LoadingSpinner /> : donations.length === 0 ? (
          <EmptyState icon={Gift} color="text-success" title="No donations yet" subtitle='Click "List Surplus Food" above to add your first item.' />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {donations.map((d) => (
              <div key={d.id} className="group rounded-xl border bg-background p-4 shadow-soft transition-all hover:shadow-medium">
                <div className="mb-2 flex items-start justify-between">
                  <Badge variant="outline" className={cn("text-xs capitalize", donationStatusColors[d.status])}>
                    {d.status.replace("_", " ")}
                  </Badge>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-foreground">{d.food_name}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">{d.category}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Package className="h-3 w-3" />{d.quantity}</div>
                  <div className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" />Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span className="truncate">{d.pickup_location}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-success/5 border-success/20 p-5">
        <h3 className="font-semibold text-foreground mb-1">🌱 Your Impact</h3>
        <p className="text-sm text-muted-foreground">
          You have listed <strong className="text-foreground">{total}</strong> donation{total !== 1 ? "s" : ""},{" "}
          <strong className="text-foreground">{claimed}</strong> of which {claimed !== 1 ? "have" : "has"} been claimed by recipient organizations.
        </p>
      </div>
    </div>
  );
}

// ─── Recipient Dashboard ─────────────────────────────────────────────────────
function RecipientDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [claimedIds, setClaimedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("claimed_donations") || "[]"); } catch { return []; }
  });
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchDonations = async () => {
    setLoading(true);
    setAvailable(getAvailableDonations());
    setLoading(false);
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleClaim = async (donation) => {
    setClaiming(donation.id);
    updateDonationStatus(donation.id, "claimed");
    const next = [...claimedIds, donation.id];
    setClaimedIds(next);
    localStorage.setItem("claimed_donations", JSON.stringify(next));
    setAvailable((prev) => prev.filter((d) => d.id !== donation.id));
    toast({ title: "Claimed! 🎉", description: `${donation.food_name} has been reserved for pickup.` });
    setClaiming(null);
  };

  const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  const urgencyClass = (days) =>
    days <= 1 ? "bg-destructive/10 text-destructive border-destructive/30"
      : days <= 3 ? "bg-warning/10 text-warning border-warning/30"
        : "bg-success/10 text-success border-success/30";

  const categories = ["all", ...new Set(available.map((d) => d.category))];
  const filtered = categoryFilter === "all" ? available : available.filter((d) => d.category === categoryFilter);
  const totalClaimed = claimedIds.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Recipient Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and claim available food donations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDonations}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available Now" value={String(available.length)} subtitle="Open donations" icon={Gift} variant="primary" onClick={() => navigate("/dashboard/donations")} />
        <StatCard title="My Claims" value={String(totalClaimed)} subtitle="This session" icon={HandHeart} variant="secondary" onClick={() => navigate("/dashboard/my-claims")} />
        <StatCard title="Expiring Soon" value={String(available.filter((d) => daysUntil(d.expiry_date) <= 2).length)} subtitle="Within 2 days" icon={Clock} variant="accent" onClick={() => navigate("/dashboard/expiring-soon")} />
        <StatCard title="Categories" value={String(new Set(available.map((d) => d.category)).size)} subtitle="Types available" icon={Package} onClick={() => navigate("/dashboard/categories")} />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? "default" : "outline"}
            className="h-7 text-xs capitalize"
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={Gift} color="text-accent" title="No donations available" subtitle="Check back soon — donors are listing new items regularly." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => {
            const days = daysUntil(d.expiry_date);
            const isClaiming = claiming === d.id;
            return (
              <div key={d.id} className="group rounded-xl border bg-card p-4 shadow-soft transition-all hover:shadow-medium">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge variant="outline" className={cn("text-xs capitalize shrink-0", urgencyClass(days))}>
                    {days <= 0 ? "Expired" : days === 1 ? "Today" : `${days}d left`}
                  </Badge>
                  <span className="text-xs capitalize text-muted-foreground">{d.category}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{d.food_name}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Package className="h-3 w-3" />{d.quantity}</div>
                  <div className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" />Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span className="truncate">{d.pickup_location}</span></div>
                </div>
                {d.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                <Button
                  size="sm" className="mt-3 w-full h-8 text-xs"
                  disabled={isClaiming}
                  onClick={() => handleClaim(d)}
                >
                  {isClaiming
                    ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Claiming...</>
                    : <><HandHeart className="mr-2 h-3 w-3" />Claim This Donation</>}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {totalClaimed > 0 && (
        <div className="rounded-xl border bg-accent/5 border-accent/20 p-5">
          <h3 className="font-semibold text-foreground mb-1">🤝 Thank You!</h3>
          <p className="text-sm text-muted-foreground">
            You've claimed <strong className="text-foreground">{totalClaimed}</strong> donation{totalClaimed !== 1 ? "s" : ""} this session.{" "}
            Please coordinate pickup with the donor at the listed location.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Analyst Dashboard ────────────────────────────────────────────────────────
function AnalystDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setDonations(getDonations());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const total = donations.length;
  const claimed = donations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length;
  const expired = donations.filter((d) => d.status === "expired").length;
  const available = donations.filter((d) => d.status === "available").length;
  const successRate = total > 0 ? Math.round((claimed / total) * 100) : 0;

  const catOrder = ["produce", "bakery", "dairy", "prepared", "pantry", "beverages", "other"];
  const catColors = { produce: "bg-success", bakery: "bg-warning", dairy: "bg-info", prepared: "bg-accent", pantry: "bg-primary", beverages: "bg-secondary", other: "bg-muted-foreground" };
  const catCounts = catOrder.reduce((acc, c) => { acc[c] = donations.filter((d) => d.category === c).length; return acc; }, {});
  const maxCat = Math.max(...Object.values(catCounts), 1);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });
  const monthlyData = months.map(({ label, year, month }) => ({
    label,
    count: donations.filter((d) => { const dd = new Date(d.created_at); return dd.getFullYear() === year && dd.getMonth() === month; }).length,
  }));
  const maxMonth = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time food waste trends and platform insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Donations" value={String(total)} subtitle="All time" icon={Gift} variant="primary" onClick={() => navigate("/dashboard/donations")} />
            <StatCard title="Success Rate" value={`${successRate}%`} subtitle="Claimed before expiry" icon={CheckCircle2} variant="secondary" trend={{ value: claimed > 0 ? `${claimed} claimed` : "None yet", positive: claimed > 0 }} onClick={() => navigate("/dashboard/success-rate")} />
            <StatCard title="Available Now" value={String(available)} subtitle="Open listings" icon={Package} variant="accent" onClick={() => navigate("/dashboard/donations")} />
            <StatCard title="Expired Listings" value={String(expired)} subtitle="Went unclaimed" icon={TrendingDown} trend={{ value: expired > 0 ? "Needs attention" : "None!", positive: expired === 0 }} onClick={() => navigate("/dashboard/expired-listings")} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Monthly Trend */}
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-info" />Donation Trend (Last 6 Months)
              </h3>
              {total === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No data yet</div>
              ) : (
                <>
                  <div className="flex h-40 items-end gap-2">
                    {monthlyData.map(({ label, count }) => (
                      <div key={label} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-medium text-foreground">{count > 0 ? count : ""}</span>
                        <div
                          className="w-full rounded-t-md gradient-primary opacity-80 transition-all hover:opacity-100 min-h-[4px]"
                          style={{ height: `${Math.max((count / maxMonth) * 100, 4)}%` }}
                          title={`${label}: ${count}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    {monthlyData.map(({ label }) => <span key={label}>{label}</span>)}
                  </div>
                </>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="mb-4 text-base font-semibold text-foreground">Food Category Breakdown</h3>
              {total === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No data yet</div>
              ) : (
                <div className="space-y-3">
                  {catOrder.filter((c) => catCounts[c] > 0).map((c) => (
                    <div key={c} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{c}</span>
                      <div className="flex-1 rounded-full bg-muted h-2">
                        <div className={cn("h-2 rounded-full transition-all duration-500", catColors[c])} style={{ width: `${Math.max((catCounts[c] / maxCat) * 100, 4)}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-medium text-foreground">{catCounts[c]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 text-base font-semibold text-foreground">Donation Status Distribution</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Available", key: "available", cls: "bg-success/10 text-success border-success/30" },
                { label: "Claimed", key: "claimed", cls: "bg-info/10 text-info border-info/30" },
                { label: "Picked Up", key: "picked_up", cls: "bg-primary/10 text-primary border-primary/30" },
                { label: "Expired", key: "expired", cls: "bg-destructive/10 text-destructive border-destructive/30" },
                { label: "Cancelled", key: "cancelled", cls: "bg-muted text-muted-foreground border-border" },
              ].map(({ label, key, cls }) => (
                <div key={key} className={cn("rounded-lg border p-3 text-center", cls)}>
                  <p className="text-2xl font-bold">{donations.filter((d) => d.status === key).length}</p>
                  <p className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {total > 0 && (
            <div className="rounded-xl border bg-info/5 border-info/20 p-5">
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-info" />Key Insight
              </h3>
              <p className="text-sm text-muted-foreground">
                {successRate >= 70
                  ? `Great performance! ${successRate}% of donations are claimed before expiry.`
                  : successRate >= 40
                    ? `${successRate}% claim rate. Consider notifying recipients earlier to improve pickup rates.`
                    : `${successRate}% claim rate — there's room to grow. Ensure recipient orgs are notified promptly when new donations are listed.`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function RoleBasedDashboard({ role }) {
  switch (role) {
    case "admin": return <AdminDashboard />;
    case "donor": return <DonorDashboard />;
    case "recipient": return <RecipientDashboard />;
    case "analyst": return <AnalystDashboard />;
    default: return <AdminDashboard />;
  }
}
