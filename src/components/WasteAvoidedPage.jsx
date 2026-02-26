import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDonationsByUser, getDonations } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Leaf, TrendingDown, Droplets, Zap, Package,
    CheckCircle2, Gift, Loader2, RefreshCw, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// ─── Impact constants (rough industry averages) ──────────────────────────────
const AVG_KG_PER_DONATION = 2.3;
const CO2_PER_KG = 2.5;       // kg CO₂ saved per kg food rescued
const WATER_PER_KG = 170;     // litres of water saved per kg food rescued
const MEALS_PER_KG = 1.8;     // average meals per kg of food

const statusColors = {
    available: "bg-success/10 text-success border-success/30",
    claimed: "bg-info/10 text-info border-info/30",
    picked_up: "bg-primary/10 text-primary border-primary/30",
    expired: "bg-destructive/10 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground border-border",
};

export function WasteAvoidedPage() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        if (!user) return;
        setLoading(true);
        const data = role === "admin" ? getDonations() : getDonationsByUser(user.id);
        setDonations(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    // ─── Computed stats ───────────────────────────────────────────────────────
    const total = donations.length;
    const claimed = donations.filter((d) => ["claimed", "picked_up"].includes(d.status));
    const available = donations.filter((d) => d.status === "available");
    const expired = donations.filter((d) => d.status === "expired");

    const rescuedDonations = [...claimed, ...available]; // food that was saved (claimed + still available)
    const kgSaved = Math.round(rescuedDonations.length * AVG_KG_PER_DONATION);
    const co2Saved = Math.round(kgSaved * CO2_PER_KG);
    const waterSaved = Math.round(kgSaved * WATER_PER_KG);
    const mealsSaved = Math.round(kgSaved * MEALS_PER_KG);
    const wasteRate = total > 0 ? Math.round((expired.length / total) * 100) : 0;
    const rescueRate = total > 0 ? Math.round((rescuedDonations.length / total) * 100) : 0;

    // ─── Impact cards data ────────────────────────────────────────────────────
    const impactCards = [
        {
            label: "Food Rescued",
            value: `~${kgSaved} kg`,
            icon: Package,
            color: "text-success",
            bg: "bg-success/10 border-success/20",
            desc: "Estimated weight of food saved from going to waste",
        },
        {
            label: "CO₂ Prevented",
            value: `~${co2Saved} kg`,
            icon: Leaf,
            color: "text-primary",
            bg: "bg-primary/5 border-primary/20",
            desc: "Greenhouse gas emissions avoided",
        },
        {
            label: "Water Saved",
            value: waterSaved >= 1000 ? `~${(waterSaved / 1000).toFixed(1)}k L` : `~${waterSaved} L`,
            icon: Droplets,
            color: "text-info",
            bg: "bg-info/10 border-info/20",
            desc: "Water footprint reduced by rescuing food",
        },
        {
            label: "Meals Provided",
            value: `~${mealsSaved}`,
            icon: Zap,
            color: "text-accent",
            bg: "bg-accent/5 border-accent/20",
            desc: "Estimated meals made possible",
        },
    ];

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
                            <Leaf className="h-7 w-7 text-success" /> Waste Avoided
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Your environmental impact from food donations</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={load}>
                    <RefreshCw className="mr-2 h-4 w-4" />Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Hero impact banner */}
                    <div className="rounded-2xl border bg-gradient-to-br from-success/10 via-primary/5 to-accent/5 p-6 sm:p-8 shadow-soft">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                                <TrendingDown className="h-8 w-8 text-success" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl">~{kgSaved} kg</h2>
                            <p className="mt-1 text-base text-muted-foreground">Total food waste avoided</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-sm px-3 py-1">
                                    {rescueRate}% rescue rate
                                </Badge>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-sm px-3 py-1">
                                    {total} total donation{total !== 1 ? "s" : ""}
                                </Badge>
                                {expired.length > 0 && (
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm px-3 py-1">
                                        {wasteRate}% expired
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4 Impact metric cards */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        {impactCards.map(({ label, value, icon: Icon, color, bg, desc }) => (
                            <div key={label} className={cn("rounded-xl border p-5 shadow-soft transition-all duration-300 hover:shadow-medium", bg)}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className={cn("rounded-xl p-2.5", bg)}>
                                        <Icon className={cn("h-5 w-5", color)} />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{value}</p>
                                <p className="text-sm font-medium text-muted-foreground mt-0.5">{label}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1.5">{desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Status breakdown */}
                    <div className="rounded-xl border bg-card p-5 shadow-soft">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" /> Donation Status Breakdown
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: "Available", count: available.length, cls: "bg-success/10 text-success border-success/30" },
                                { label: "Claimed", count: claimed.length, cls: "bg-info/10 text-info border-info/30" },
                                { label: "Expired", count: expired.length, cls: "bg-destructive/10 text-destructive border-destructive/30" },
                                { label: "Cancelled", count: donations.filter((d) => d.status === "cancelled").length, cls: "bg-muted text-muted-foreground border-border" },
                            ].map(({ label, count, cls }) => (
                                <div key={label} className={cn("rounded-lg border p-3 text-center", cls)}>
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-xs mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Visual progress bar */}
                        {total > 0 && (
                            <div className="mt-5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Rescue progress</span>
                                    <span className="font-semibold text-success">{rescueRate}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-success to-primary transition-all duration-700"
                                        style={{ width: `${rescueRate}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Donation history table */}
                    <div className="rounded-xl border bg-card p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Gift className="h-5 w-5 text-success" /> Donation Impact Details
                            </h3>
                            <span className="text-xs text-muted-foreground">{total} donation{total !== 1 ? "s" : ""}</span>
                        </div>
                        {total === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
                                <div className="mb-3 rounded-xl bg-muted p-3">
                                    <TrendingDown className="h-7 w-7 text-success" />
                                </div>
                                <p className="font-medium text-foreground">No donations yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">Start donating to see your environmental impact grow!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Food Item</th>
                                            <th className="pb-2 pr-4 font-medium">Category</th>
                                            <th className="pb-2 pr-4 font-medium">Qty</th>
                                            <th className="pb-2 pr-4 font-medium">Status</th>
                                            <th className="pb-2 pr-4 font-medium">Est. Saved</th>
                                            <th className="pb-2 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {donations.slice().reverse().map((d) => {
                                            const isRescued = ["available", "claimed", "picked_up"].includes(d.status);
                                            const estKg = isRescued ? AVG_KG_PER_DONATION.toFixed(1) : "0";
                                            return (
                                                <tr key={d.id} className="hover:bg-muted/30">
                                                    <td className="py-2.5 pr-4 font-medium text-foreground">{d.food_name}</td>
                                                    <td className="py-2.5 pr-4 capitalize text-muted-foreground">{d.category}</td>
                                                    <td className="py-2.5 pr-4 text-muted-foreground">{d.quantity}</td>
                                                    <td className="py-2.5 pr-4">
                                                        <Badge variant="outline" className={cn("text-xs capitalize", statusColors[d.status])}>
                                                            {d.status.replace("_", " ")}
                                                        </Badge>
                                                    </td>
                                                    <td className={cn("py-2.5 pr-4 font-medium", isRescued ? "text-success" : "text-muted-foreground")}>
                                                        {isRescued ? `~${estKg} kg` : "—"}
                                                    </td>
                                                    <td className="py-2.5 text-muted-foreground">
                                                        {d.created_at ? format(new Date(d.created_at), "MMM d, yyyy") : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Motivational footer */}
                    <div className="rounded-xl border bg-success/5 border-success/20 p-5">
                        <h3 className="font-semibold text-foreground mb-1">🌱 Every Donation Counts</h3>
                        <p className="text-sm text-muted-foreground">
                            Each food donation prevents approximately <strong className="text-foreground">{AVG_KG_PER_DONATION} kg</strong> of food waste,
                            saves <strong className="text-foreground">{WATER_PER_KG} litres</strong> of water,
                            and prevents <strong className="text-foreground">{CO2_PER_KG} kg</strong> of CO₂ emissions.
                            Keep up the great work!
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
