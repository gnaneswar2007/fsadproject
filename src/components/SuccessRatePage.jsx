import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    CheckCircle2, Loader2, RefreshCw, ArrowLeft, Gift,
    Clock, Truck, TrendingUp, BarChart3, Target, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/ExportMenu";

export function SuccessRatePage() {
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
    const claimed = donations.filter((d) => d.status === "claimed");
    const pickedUp = donations.filter((d) => d.status === "picked_up");
    const expired = donations.filter((d) => d.status === "expired");
    const available = donations.filter((d) => d.status === "available");
    const cancelled = donations.filter((d) => d.status === "cancelled");

    const successfulDonations = [...claimed, ...pickedUp];
    const successRate = total > 0 ? Math.round((successfulDonations.length / total) * 100) : 0;
    const pickupRate = successfulDonations.length > 0 ? Math.round((pickedUp.length / successfulDonations.length) * 100) : 0;
    const expiryRate = total > 0 ? Math.round((expired.length / total) * 100) : 0;

    // Monthly success data (last 6 months)
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { label: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
    });

    const monthlyData = months.map(({ label, year, month }) => {
        const monthDonations = donations.filter((d) => {
            const dd = new Date(d.created_at);
            return dd.getFullYear() === year && dd.getMonth() === month;
        });
        const monthClaimed = monthDonations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length;
        const rate = monthDonations.length > 0 ? Math.round((monthClaimed / monthDonations.length) * 100) : 0;
        return { label, total: monthDonations.length, claimed: monthClaimed, rate };
    });
    const maxMonthTotal = Math.max(...monthlyData.map((m) => m.total), 1);

    // Category success breakdown
    const categories = [...new Set(donations.map((d) => d.category))];
    const categoryData = categories.map((cat) => {
        const catDonations = donations.filter((d) => d.category === cat);
        const catClaimed = catDonations.filter((d) => ["claimed", "picked_up"].includes(d.status)).length;
        const rate = catDonations.length > 0 ? Math.round((catClaimed / catDonations.length) * 100) : 0;
        return { category: cat, total: catDonations.length, claimed: catClaimed, rate };
    }).sort((a, b) => b.rate - a.rate);

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
                            <Target className="h-7 w-7 text-primary" /> Success Rate Analytics
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">How effectively donations are being claimed and picked up</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu data={donations} filename="success-rate-report" pdfTitle="Success Rate Report" />
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
                    {/* Hero success banner */}
                    <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-success/5 to-info/5 p-6 sm:p-8 shadow-soft">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                                <CheckCircle2 className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-5xl font-extrabold text-foreground sm:text-6xl">{successRate}%</h2>
                            <p className="mt-1 text-base text-muted-foreground">Overall Claim Success Rate</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <Badge variant="outline" className="bg-info/10 text-info border-info/30 text-sm px-3 py-1">
                                    {successfulDonations.length} claimed
                                </Badge>
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-sm px-3 py-1">
                                    {available.length} available
                                </Badge>
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm px-3 py-1">
                                    {expired.length} expired
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Metric cards */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">Claim Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{successRate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">{successfulDonations.length} of {total} donations</p>
                        </div>
                        <div className="rounded-xl border bg-success/5 border-success/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="h-4 w-4 text-success" />
                                <span className="text-xs font-medium text-muted-foreground">Pickup Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{pickupRate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">{pickedUp.length} picked up of {successfulDonations.length} claimed</p>
                        </div>
                        <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-destructive" />
                                <span className="text-xs font-medium text-muted-foreground">Expiry Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{expiryRate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">{expired.length} expired unclaimed</p>
                        </div>
                        <div className="rounded-xl border bg-info/5 border-info/20 p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-info" />
                                <span className="text-xs font-medium text-muted-foreground">Active Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{total > 0 ? Math.round((available.length / total) * 100) : 0}%</p>
                            <p className="text-xs text-muted-foreground mt-1">{available.length} currently available</p>
                        </div>
                    </div>

                    {/* Monthly trend chart */}
                    <div className="rounded-xl border bg-card p-5 shadow-soft">
                        <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-info" /> Monthly Success Trend
                        </h3>
                        {total === 0 ? (
                            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No data yet — donations will appear here once listed.</div>
                        ) : (
                            <>
                                <div className="flex h-44 items-end gap-3">
                                    {monthlyData.map(({ label, total: t, claimed: c, rate }) => (
                                        <div key={label} className="flex flex-1 flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-foreground">{rate > 0 ? `${rate}%` : ""}</span>
                                            <div className="relative w-full flex flex-col items-center gap-0.5" style={{ height: "120px" }}>
                                                {/* Total bar */}
                                                <div
                                                    className="w-full rounded-t-md bg-muted/60 transition-all"
                                                    style={{ height: `${Math.max((t / maxMonthTotal) * 100, 4)}%` }}
                                                    title={`${label}: ${t} total`}
                                                />
                                                {/* Claimed overlay */}
                                                <div
                                                    className="w-full rounded-t-md bg-primary/60 transition-all absolute bottom-0"
                                                    style={{ height: `${Math.max((c / maxMonthTotal) * 100, t > 0 ? 4 : 0)}%` }}
                                                    title={`${label}: ${c} claimed`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                    {monthlyData.map(({ label }) => <span key={label}>{label}</span>)}
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-muted/60" /> Total</div>
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary/60" /> Claimed</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Category breakdown */}
                    {categoryData.length > 0 && (
                        <div className="rounded-xl border bg-card p-5 shadow-soft">
                            <h3 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
                                <Package className="h-5 w-5 text-accent" /> Success Rate by Category
                            </h3>
                            <div className="space-y-3">
                                {categoryData.map(({ category, total: t, claimed: c, rate }) => (
                                    <div key={category} className="flex items-center gap-3">
                                        <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{category}</span>
                                        <div className="flex-1">
                                            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500",
                                                        rate >= 70 ? "bg-success" : rate >= 40 ? "bg-warning" : "bg-destructive"
                                                    )}
                                                    style={{ width: `${Math.max(rate, 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="w-12 shrink-0 text-right text-sm font-semibold text-foreground">{rate}%</span>
                                        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">{c}/{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Insight */}
                    {total > 0 && (
                        <div className="rounded-xl border bg-info/5 border-info/20 p-5">
                            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-info" /> Key Insight
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {successRate >= 70
                                    ? `Excellent! ${successRate}% of donations are successfully claimed. The platform is working well to reduce food waste.`
                                    : successRate >= 40
                                        ? `${successRate}% claim rate shows room for improvement. Consider notifying recipients faster when new donations appear.`
                                        : `${successRate}% claim rate needs attention. Ensure recipient organizations are actively monitoring for new donations.`}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
