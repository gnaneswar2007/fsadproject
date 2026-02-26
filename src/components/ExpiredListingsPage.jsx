import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    TrendingDown, Loader2, RefreshCw, ArrowLeft, Gift,
    CalendarIcon, MapPin, Package, AlertTriangle, Clock,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/ExportMenu";

export function ExpiredListingsPage() {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        setDonations(getDonations());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const total = donations.length;
    const expired = donations.filter((d) => d.status === "expired");
    const claimed = donations.filter((d) => ["claimed", "picked_up"].includes(d.status));
    const available = donations.filter((d) => d.status === "available");
    const expiryRate = total > 0 ? Math.round((expired.length / total) * 100) : 0;
    const wasteKg = Math.round(expired.length * 2.3);

    // Category breakdown of expired items
    const expiredByCategory = {};
    expired.forEach((d) => {
        const cat = d.category || "other";
        expiredByCategory[cat] = (expiredByCategory[cat] || 0) + 1;
    });
    const sortedCategories = Object.entries(expiredByCategory).sort((a, b) => b[1] - a[1]);
    const maxCatCount = Math.max(...Object.values(expiredByCategory), 1);

    // Time-based analysis
    const daysExpiredAgo = (d) => {
        const expiry = new Date(d.expiry_date);
        return Math.max(0, Math.ceil((new Date() - expiry) / (1000 * 60 * 60 * 24)));
    };

    const recentlyExpired = expired.filter((d) => daysExpiredAgo(d) <= 7);
    const olderExpired = expired.filter((d) => daysExpiredAgo(d) > 7);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-2">
                            <TrendingDown className="h-7 w-7 text-destructive" /> Expired Listings
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Donations that went unclaimed and expired</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu data={expired} filename="expired-listings" pdfTitle="Expired Listings Report" />
                    <Button variant="outline" size="sm" onClick={load}>
                        <RefreshCw className="mr-2 h-4 w-4" />Refresh
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Hero banner */}
                    <div className={cn(
                        "rounded-2xl border p-6 sm:p-8 shadow-soft",
                        expired.length > 0
                            ? "bg-gradient-to-br from-destructive/10 via-warning/5 to-muted"
                            : "bg-gradient-to-br from-success/10 via-primary/5 to-muted"
                    )}>
                        <div className="text-center">
                            <div className={cn(
                                "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full",
                                expired.length > 0 ? "bg-destructive/15" : "bg-success/15"
                            )}>
                                {expired.length > 0
                                    ? <AlertTriangle className="h-8 w-8 text-destructive" />
                                    : <Gift className="h-8 w-8 text-success" />
                                }
                            </div>
                            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl">{expired.length}</h2>
                            <p className="mt-1 text-base text-muted-foreground">
                                {expired.length === 0 ? "No expired listings — great job!" : "Expired Donations"}
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm px-3 py-1">
                                    {expiryRate}% waste rate
                                </Badge>
                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-sm px-3 py-1">
                                    ~{wasteKg} kg wasted
                                </Badge>
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-sm px-3 py-1">
                                    {claimed.length} successfully claimed
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Metric cards */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <span className="text-xs font-medium text-muted-foreground">Total Expired</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{expired.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">of {total} total donations</p>
                        </div>
                        <div className="rounded-xl border bg-warning/5 border-warning/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-warning" />
                                <span className="text-xs font-medium text-muted-foreground">Recent (7 days)</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{recentlyExpired.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Expired in last week</p>
                        </div>
                        <div className="rounded-xl border bg-muted border-border p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Food Wasted</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">~{wasteKg} kg</p>
                            <p className="text-xs text-muted-foreground mt-1">Estimated weight lost</p>
                        </div>
                        <div className="rounded-xl border bg-info/5 border-info/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-info" />
                                <span className="text-xs font-medium text-muted-foreground">Waste Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{expiryRate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">{available.length} still available</p>
                        </div>
                    </div>

                    {/* Status comparison */}
                    {total > 0 && (
                        <div className="rounded-xl border bg-card p-5 shadow-soft">
                            <h3 className="mb-4 text-base font-semibold text-foreground">Donation Outcomes</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Claimed / Picked Up", count: claimed.length, color: "bg-success", pct: Math.round((claimed.length / total) * 100) },
                                    { label: "Available", count: available.length, color: "bg-info", pct: Math.round((available.length / total) * 100) },
                                    { label: "Expired", count: expired.length, color: "bg-destructive", pct: expiryRate },
                                ].map(({ label, count, color, pct }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
                                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.max(pct, 2)}%` }} />
                                        </div>
                                        <span className="w-10 shrink-0 text-right text-sm font-semibold text-foreground">{pct}%</span>
                                        <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category breakdown of expired */}
                    {sortedCategories.length > 0 && (
                        <div className="rounded-xl border bg-card p-5 shadow-soft">
                            <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                                <Package className="h-5 w-5 text-destructive" /> Expired by Category
                            </h3>
                            <div className="space-y-3">
                                {sortedCategories.map(([cat, count]) => (
                                    <div key={cat} className="flex items-center gap-3">
                                        <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{cat}</span>
                                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-destructive/60 transition-all duration-500" style={{ width: `${Math.max((count / maxCatCount) * 100, 4)}%` }} />
                                        </div>
                                        <span className="w-8 shrink-0 text-right text-sm font-medium text-foreground">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expired donations table */}
                    {expired.length > 0 && (
                        <div className="rounded-xl border bg-card p-5 shadow-soft">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-destructive" /> Expired Items
                                </h3>
                                <span className="text-xs text-muted-foreground">{expired.length} item{expired.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Food Item</th>
                                            <th className="pb-2 pr-4 font-medium">Category</th>
                                            <th className="pb-2 pr-4 font-medium">Qty</th>
                                            <th className="pb-2 pr-4 font-medium">Expired On</th>
                                            <th className="pb-2 font-medium">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {expired.slice().sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date)).map((d) => (
                                            <tr key={d.id} className="hover:bg-muted/30">
                                                <td className="py-2.5 pr-4 font-medium text-foreground">{d.food_name}</td>
                                                <td className="py-2.5 pr-4 capitalize text-muted-foreground">{d.category}</td>
                                                <td className="py-2.5 pr-4 text-muted-foreground">{d.quantity}</td>
                                                <td className="py-2.5 pr-4 text-destructive">
                                                    {format(new Date(d.expiry_date), "MMM d, yyyy")}
                                                </td>
                                                <td className="py-2.5 text-muted-foreground truncate max-w-[200px]">{d.pickup_location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Insight */}
                    <div className={cn(
                        "rounded-xl border p-5",
                        expired.length === 0 ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"
                    )}>
                        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            {expired.length === 0 ? "🎉 Zero Waste!" : "💡 Recommendations"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {expired.length === 0
                                ? "All donations have been claimed or are still available. Great work keeping food waste at zero!"
                                : expiryRate > 30
                                    ? "High expiry rate detected. Consider: shorter listing windows, faster notification to recipients, or more targeted donor-recipient matching."
                                    : "Some donations expired unclaimed. Prompt recipient notifications and shorter expiry windows can help reduce waste further."}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
