import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import {
  BarChart3, RefreshCw, Gift, CheckCircle2,
  Package, TrendingDown, Clock, Loader2,
} from "lucide-react";
import { getDonations } from "@/lib/mock-db";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const catColors = {
  produce: "bg-success", bakery: "bg-warning", dairy: "bg-info",
  prepared: "bg-accent", pantry: "bg-primary", beverages: "bg-secondary", other: "bg-muted-foreground",
};
const catOrder = ["produce", "bakery", "dairy", "prepared", "pantry", "beverages", "other"];

const statusList = [
  { label: "Available", key: "available", cls: "bg-success/10 text-success border-success/30" },
  { label: "Claimed", key: "claimed", cls: "bg-info/10 text-info border-info/30" },
  { label: "Picked Up", key: "picked_up", cls: "bg-primary/10 text-primary border-primary/30" },
  { label: "Expired", key: "expired", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  { label: "Cancelled", key: "cancelled", cls: "bg-muted text-muted-foreground border-border" },
];

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setDonations(getDonations());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Aggregations
  const total = donations.length;
  const claimed = donations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length;
  const expired = donations.filter((d) => d.status === "expired").length;
  const available = donations.filter((d) => d.status === "available").length;
  const successRate = total > 0 ? Math.round((claimed / total) * 100) : 0;
  const wasteRate = total > 0 ? Math.round((expired / total) * 100) : 0;

  // Category counts
  const catCounts = catOrder.reduce((acc, c) => { acc[c] = donations.filter((d) => d.category === c).length; return acc; }, {});
  const maxCat = Math.max(...Object.values(catCounts), 1);

  // 6-month trend
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });
  const monthlyData = months.map(({ label, year, month }) => ({
    label,
    total: donations.filter((d) => { const dd = new Date(d.created_at); return dd.getFullYear() === year && dd.getMonth() === month; }).length,
    claimed: donations.filter((d) => {
      const dd = new Date(d.created_at);
      return dd.getFullYear() === year && dd.getMonth() === month && ["claimed", "picked_up"].includes(d.status);
    }).length,
  }));
  const maxMonth = Math.max(...monthlyData.map((m) => m.total), 1);

  // Daily trend (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleString("default", { weekday: "short" }),
      date: d.toDateString(),
      count: donations.filter((don) => new Date(don.created_at).toDateString() === d.toDateString()).length,
    };
  });
  const maxDay = Math.max(...days.map((d) => d.count), 1);

  const insightMsg = successRate >= 70
    ? `Excellent! ${successRate}% of donations are claimed. Platform is performing well.`
    : successRate >= 40
      ? `${successRate}% claim rate. Notify recipient organizations earlier to boost pickups.`
      : total === 0
        ? "No donations recorded yet. Data will appear once donors list food."
        : `${successRate}% claim rate — consider sending alerts to recipients when new items are listed.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Food waste trends and platform performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* KPI row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Donations" value={String(total)} subtitle="All time" icon={Gift} variant="primary" onClick={() => navigate("/dashboard/donations")} />
            <StatCard title="Claim Rate" value={`${successRate}%`} subtitle="Claimed before expiry" icon={CheckCircle2} variant="secondary" trend={{ value: claimed > 0 ? `${claimed} claimed` : "None yet", positive: claimed > 0 }} />
            <StatCard title="Available Now" value={String(available)} subtitle="Open listings" icon={Package} variant="accent" onClick={() => navigate("/dashboard/active-listings")} />
            <StatCard title="Waste Rate" value={`${wasteRate}%`} subtitle="Expired unclaimed" icon={TrendingDown} trend={{ value: expired > 0 ? `${expired} expired` : "None!", positive: expired === 0 }} />
          </div>

          {/* Charts row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Monthly Trend */}
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-info" />Monthly Donations (Last 6 Months)
              </h3>
              {total === 0 ? (
                <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No data yet</div>
              ) : (
                <>
                  <div className="flex h-44 items-end gap-2">
                    {monthlyData.map(({ label, total: t, claimed: c }) => (
                      <div key={label} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-foreground">{t > 0 ? t : ""}</span>
                        <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: `${Math.max((t / maxMonth) * 144, 4)}px` }}>
                          <div className="w-full rounded-t-md gradient-primary opacity-80 hover:opacity-100 transition-all" style={{ flex: t > 0 ? `${c / (t || 1)}` : "0 0 4px", minHeight: "4px" }} title={`Claimed: ${c}`} />
                          {t - c > 0 && <div className="w-full bg-muted-foreground/20 rounded-sm" style={{ flex: `${(t - c) / (t || 1)}`, minHeight: "2px" }} title={`Other: ${t - c}`} />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    {monthlyData.map(({ label }) => <span key={label}>{label}</span>)}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm gradient-primary inline-block" />Claimed</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-muted-foreground/20 inline-block" />Other</span>
                  </div>
                </>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="mb-4 text-base font-semibold text-foreground">Food Category Breakdown</h3>
              {total === 0 ? (
                <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No data yet</div>
              ) : (
                <div className="space-y-3 pt-1">
                  {catOrder.filter((c) => catCounts[c] > 0).map((c) => (
                    <div key={c} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{c}</span>
                      <div className="flex-1 rounded-full bg-muted h-2.5">
                        <div
                          className={cn("h-2.5 rounded-full transition-all duration-500", catColors[c])}
                          style={{ width: `${Math.max((catCounts[c] / maxCat) * 100, 4)}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-medium text-foreground">{catCounts[c]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend (last 7 days) */}
          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />Daily Activity (Last 7 Days)
            </h3>
            {total === 0 ? (
              <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <>
                <div className="flex h-28 items-end gap-3">
                  {days.map(({ label, count }) => (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium text-foreground">{count > 0 ? count : ""}</span>
                      <div
                        className="w-full rounded-t-md bg-warning/60 hover:bg-warning transition-all min-h-[4px]"
                        style={{ height: `${Math.max((count / maxDay) * 96, 4)}px` }}
                        title={`${label}: ${count}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  {days.map(({ label }) => <span key={label}>{label}</span>)}
                </div>
              </>
            )}
          </div>

          {/* Status Distribution */}
          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 text-base font-semibold text-foreground">Status Distribution</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {statusList.map(({ label, key, cls }) => (
                <div key={key} className={cn("rounded-xl border p-4 text-center", cls)}>
                  <p className="text-2xl font-bold">{donations.filter((d) => d.status === key).length}</p>
                  <p className="text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insight */}
          <div className="rounded-xl border bg-info/5 border-info/20 p-5">
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-info" />Key Insight
            </h3>
            <p className="text-sm text-muted-foreground">{insightMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}
