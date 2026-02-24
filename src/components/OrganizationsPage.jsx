import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Building2, Loader2, RefreshCw, Users, Gift,
  CheckCircle2, Clock, MapPin, CalendarIcon, Package,
} from "lucide-react";

// ─── Status colors ───────────────────────────────────────────────────────────
const statusColors = {
  available: "bg-success/10 text-success border-success/30",
  claimed:   "bg-info/10 text-info border-info/30",
  picked_up: "bg-primary/10 text-primary border-primary/30",
  expired:   "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ─── Admin view: all orgs/profiles ───────────────────────────────────────────
function AdminOrgsView() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    setProfiles([]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">All registered donors and recipient organizations</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Registered</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{profiles.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">With Organization</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {profiles.filter((p) => p.organization_name).length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft sm:col-span-1 col-span-2">
          <p className="text-xs text-muted-foreground">Individual Users</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {profiles.filter((p) => !p.organization_name).length}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No organizations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Users will appear here once they register.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">All Organizations &amp; Users</h2>
          </div>
          <div className="divide-y">
            {profiles.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {(p.full_name || p.organization_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.full_name || "Unnamed User"}</p>
                    {p.organization_name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />{p.organization_name}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Joined {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recipient view: their claimed donations ──────────────────────────────────
function RecipientOrgsView() {
  const { user } = useAuth();
  const [claimed, setClaimed]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [claimedIds]            = useState(() => {
    try { return JSON.parse(localStorage.getItem("claimed_donations") || "[]"); } catch { return []; }
  });

  const load = async () => {
    setLoading(true);
    const mine = [];
    setClaimed(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your claimed donations and pickup schedule</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Claimed</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{claimed.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Awaiting Pickup</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {claimed.filter((d) => d.status === "claimed").length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft sm:col-span-1 col-span-2">
          <p className="text-xs text-muted-foreground">Picked Up</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {claimed.filter((d) => d.status === "picked_up").length}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : claimed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No claimed donations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Head to the Dashboard to browse and claim food donations.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-foreground">Claimed Donations</h2>
          </div>
          <div className="divide-y">
            {claimed.map((d) => (
              <div key={d.id} className="flex flex-col gap-1 px-5 py-4 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.food_name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" />{d.quantity}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.pickup_location}</span>
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs capitalize shrink-0 self-start sm:self-auto", statusColors[d.status])}>
                  {d.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function OrganizationsPage({ userRole }) {
  if (userRole === "recipient") return <RecipientOrgsView />;
  return <AdminOrgsView />;
}
