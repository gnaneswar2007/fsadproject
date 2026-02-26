import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Package, Loader2, RefreshCw, ArrowLeft, Gift,
    CalendarIcon, MapPin, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/ExportMenu";

export function ActiveListingsPage() {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        const all = getDonations();
        // Only show available (active) listings
        const active = all.filter((d) => d.status === "available");
        setDonations(active.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)));
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

    const urgencyColor = (days) =>
        days <= 0 ? "bg-destructive/10 text-destructive border-destructive/30"
            : days <= 1 ? "bg-destructive/10 text-destructive border-destructive/30"
                : days <= 3 ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-success/10 text-success border-success/30";

    const expiringToday = donations.filter((d) => daysUntil(d.expiry_date) <= 1);
    const expiringThisWeek = donations.filter((d) => { const days = daysUntil(d.expiry_date); return days > 1 && days <= 3; });
    const expiringLater = donations.filter((d) => daysUntil(d.expiry_date) > 3);

    // Category counts
    const categories = {};
    donations.forEach((d) => { categories[d.category] = (categories[d.category] || 0) + 1; });
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

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
                            <Package className="h-7 w-7 text-secondary" /> Active Listings
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">All currently available food donations on the platform</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu data={donations} filename="active-listings" pdfTitle="Active Listings Report" />
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
                    {/* Summary card */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border bg-success/5 border-success/20 p-4 text-center shadow-soft">
                            <p className="text-3xl font-bold text-success">{donations.length}</p>
                            <p className="text-sm text-muted-foreground">Total Active</p>
                        </div>
                    </div>

                    {/* Category breakdown */}
                    {sortedCategories.length > 0 && (
                        <div className="rounded-xl border bg-card p-5 shadow-soft">
                            <h3 className="mb-3 text-base font-semibold text-foreground">By Category</h3>
                            <div className="flex flex-wrap gap-2">
                                {sortedCategories.map(([cat, count]) => (
                                    <Badge key={cat} variant="outline" className="text-sm capitalize px-3 py-1.5">
                                        {cat} <span className="ml-1.5 font-bold">{count}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Listings table */}
                    {donations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
                            <div className="mb-3 rounded-xl bg-muted p-3">
                                <Package className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-foreground">No active listings</p>
                            <p className="mt-1 text-sm text-muted-foreground">All donations have been claimed or expired.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
                            <div className="px-5 py-4 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-success" /> All Active Listings
                                </h3>
                                <span className="text-xs text-muted-foreground">{donations.length} listing{donations.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground bg-muted/30">
                                            <th className="px-5 py-3 font-medium">Food Item</th>
                                            <th className="px-4 py-3 font-medium">Category</th>
                                            <th className="px-4 py-3 font-medium">Qty</th>
                                            <th className="px-4 py-3 font-medium">Expiry</th>
                                            <th className="px-4 py-3 font-medium">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {donations.map((d) => {
                                            const days = daysUntil(d.expiry_date);
                                            return (
                                                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-foreground">{d.food_name}</td>
                                                    <td className="px-4 py-3 capitalize text-muted-foreground">{d.category}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{d.quantity}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {format(new Date(d.expiry_date), "MMM d, yyyy")}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">{d.pickup_location}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
