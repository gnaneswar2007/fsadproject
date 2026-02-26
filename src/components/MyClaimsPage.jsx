import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getDonations, getDonationsByUser, updateDonationStatus } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    HandHeart, Loader2, RefreshCw, ArrowLeft, Package,
    CalendarIcon, MapPin, CheckCircle2, Clock, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
    claimed: "bg-info/10 text-info border-info/30",
    picked_up: "bg-primary/10 text-primary border-primary/30",
};

const statusIcons = {
    claimed: Clock,
    picked_up: Truck,
};

export function MyClaimsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        // Get claimed donation IDs from localStorage
        let claimedIds = [];
        try {
            claimedIds = JSON.parse(localStorage.getItem("claimed_donations") || "[]");
        } catch { claimedIds = []; }

        // Fetch full donation objects for claimed IDs
        const allDonations = getDonations();
        const myClaimedDonations = allDonations.filter((d) => claimedIds.includes(d.id));
        setClaims(myClaimedDonations);
        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    const handleMarkPickedUp = (donation) => {
        updateDonationStatus(donation.id, "picked_up");
        setClaims((prev) => prev.map((d) => d.id === donation.id ? { ...d, status: "picked_up" } : d));
        toast({ title: "Picked Up! ✅", description: `${donation.food_name} marked as picked up.` });
    };

    const pendingClaims = claims.filter((d) => d.status === "claimed");
    const pickedUp = claims.filter((d) => d.status === "picked_up");

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
                            <HandHeart className="h-7 w-7 text-secondary" /> My Claims
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Food donations you've claimed for pickup</p>
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
            ) : claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-14 text-center">
                    <div className="mb-3 rounded-xl bg-secondary/10 p-3">
                        <HandHeart className="h-7 w-7 text-secondary" />
                    </div>
                    <p className="font-medium text-foreground">No claims yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Browse available donations and claim food for your organization.</p>
                    <Button size="sm" className="mt-4" onClick={() => navigate("/dashboard")}>
                        Browse Donations
                    </Button>
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                        <div className="rounded-xl border bg-info/5 border-info/20 p-4 text-center">
                            <p className="text-3xl font-bold text-info">{claims.length}</p>
                            <p className="text-sm text-muted-foreground">Total Claims</p>
                        </div>
                        <div className="rounded-xl border bg-warning/5 border-warning/20 p-4 text-center">
                            <p className="text-3xl font-bold text-warning">{pendingClaims.length}</p>
                            <p className="text-sm text-muted-foreground">Pending Pickup</p>
                        </div>
                        <div className="rounded-xl border bg-primary/5 border-primary/20 p-4 text-center">
                            <p className="text-3xl font-bold text-primary">{pickedUp.length}</p>
                            <p className="text-sm text-muted-foreground">Picked Up</p>
                        </div>
                    </div>

                    {/* Claims list */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {claims.map((d) => {
                            const StatusIcon = statusIcons[d.status] || Clock;
                            return (
                                <div key={d.id} className="group rounded-xl border bg-card p-4 shadow-soft transition-all hover:shadow-medium">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <Badge variant="outline" className={cn("text-xs capitalize shrink-0 flex items-center gap-1", statusColors[d.status] || "bg-muted text-muted-foreground")}>
                                            <StatusIcon className="h-3 w-3" />
                                            {d.status.replace("_", " ")}
                                        </Badge>
                                        <span className="text-xs capitalize text-muted-foreground">{d.category}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{d.food_name}</p>
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><Package className="h-3 w-3" />{d.quantity}</div>
                                        <div className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" />Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}</div>
                                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span className="truncate">{d.pickup_location}</span></div>
                                    </div>
                                    {d.status === "claimed" && (
                                        <Button size="sm" className="mt-3 w-full h-8 text-xs" onClick={() => handleMarkPickedUp(d)}>
                                            <CheckCircle2 className="mr-2 h-3 w-3" />Mark as Picked Up
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
