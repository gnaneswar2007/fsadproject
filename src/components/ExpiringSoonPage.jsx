import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAvailableDonations } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Clock, Loader2, RefreshCw, ArrowLeft, Package,
    CalendarIcon, MapPin, AlertTriangle, HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { updateDonationStatus } from "@/lib/mock-db";

export function ExpiringSoonPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);

    const load = () => {
        setLoading(true);
        const available = getAvailableDonations();
        // Sort by expiry date (soonest first)
        const sorted = available.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        setDonations(sorted);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

    const urgencyColor = (days) =>
        days <= 0 ? "bg-destructive/10 text-destructive border-destructive/30"
            : days <= 1 ? "bg-destructive/10 text-destructive border-destructive/30"
                : days <= 3 ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-success/10 text-success border-success/30";

    const urgencyLabel = (days) =>
        days <= 0 ? "Expired" : days === 1 ? "Today!" : `${days} days left`;

    const handleClaim = (donation) => {
        setClaiming(donation.id);
        updateDonationStatus(donation.id, "claimed");
        const claimedIds = JSON.parse(localStorage.getItem("claimed_donations") || "[]");
        claimedIds.push(donation.id);
        localStorage.setItem("claimed_donations", JSON.stringify(claimedIds));
        setDonations((prev) => prev.filter((d) => d.id !== donation.id));
        toast({ title: "Claimed! 🎉", description: `${donation.food_name} has been reserved for pickup.` });
        setClaiming(null);
    };

    const expiringToday = donations.filter((d) => daysUntil(d.expiry_date) <= 1);
    const expiringThisWeek = donations.filter((d) => { const days = daysUntil(d.expiry_date); return days > 1 && days <= 3; });
    const expiringLater = donations.filter((d) => daysUntil(d.expiry_date) > 3);

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
                            <Clock className="h-7 w-7 text-warning" /> Expiring Soon
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Donations that need urgent claiming before they expire</p>
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
            ) : donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
                    <div className="mb-3 rounded-xl bg-success/10 p-3">
                        <Clock className="h-7 w-7 text-success" />
                    </div>
                    <p className="font-medium text-foreground">No available donations right now</p>
                    <p className="mt-1 text-sm text-muted-foreground">Check back soon — donors list new items regularly.</p>
                </div>
            ) : (
                <>
                    {/* Urgency summary */}
                    <div className="grid gap-4 grid-cols-3">
                        <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <p className="text-3xl font-bold text-destructive">{expiringToday.length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Expiring Today</p>
                        </div>
                        <div className="rounded-xl border bg-warning/5 border-warning/20 p-4 text-center">
                            <p className="text-3xl font-bold text-warning">{expiringThisWeek.length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Within 3 Days</p>
                        </div>
                        <div className="rounded-xl border bg-success/5 border-success/20 p-4 text-center">
                            <p className="text-3xl font-bold text-success">{expiringLater.length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Later</p>
                        </div>
                    </div>

                    {/* Urgency alert */}
                    {expiringToday.length > 0 && (
                        <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-foreground">⚠️ Urgent: {expiringToday.length} donation{expiringToday.length !== 1 ? "s" : ""} expiring today!</p>
                                <p className="text-sm text-muted-foreground">Claim them now before they go to waste.</p>
                            </div>
                        </div>
                    )}

                    {/* Donation cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {donations.map((d) => {
                            const days = daysUntil(d.expiry_date);
                            const isClaiming = claiming === d.id;
                            return (
                                <div key={d.id} className={cn(
                                    "group rounded-xl border bg-card p-4 shadow-soft transition-all hover:shadow-medium",
                                    days <= 1 && "ring-2 ring-destructive/30"
                                )}>
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <Badge variant="outline" className={cn("text-xs capitalize shrink-0", urgencyColor(days))}>
                                            {urgencyLabel(days)}
                                        </Badge>
                                        <span className="text-xs capitalize text-muted-foreground">{d.category}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{d.food_name}</p>
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><Package className="h-3 w-3" />{d.quantity}</div>
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-3 w-3" />
                                            Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3" /><span className="truncate">{d.pickup_location}</span>
                                        </div>
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
                </>
            )}
        </div>
    );
}
