import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableDonations, updateDonationStatus } from "@/lib/mock-db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Package, Loader2, RefreshCw, ArrowLeft, Gift,
    CalendarIcon, MapPin, HandHeart, Apple, Croissant,
    Milk, ChefHat, ShoppingBasket, GlassWater, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const categoryMeta = {
    produce: { icon: Apple, color: "text-success", bg: "bg-success/10 border-success/20", label: "Produce" },
    bakery: { icon: Croissant, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Bakery" },
    dairy: { icon: Milk, color: "text-info", bg: "bg-info/10 border-info/20", label: "Dairy" },
    prepared: { icon: ChefHat, color: "text-accent", bg: "bg-accent/10 border-accent/20", label: "Prepared" },
    pantry: { icon: ShoppingBasket, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Pantry" },
    beverages: { icon: GlassWater, color: "text-secondary", bg: "bg-secondary/10 border-secondary/20", label: "Beverages" },
    other: { icon: MoreHorizontal, color: "text-muted-foreground", bg: "bg-muted border-border", label: "Other" },
};

export function CategoriesPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [claiming, setClaiming] = useState(null);

    const load = () => {
        setLoading(true);
        setDonations(getAvailableDonations());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    // Build category groups
    const categories = {};
    donations.forEach((d) => {
        const cat = d.category || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(d);
    });

    const sortedCategories = Object.keys(categories).sort((a, b) => categories[b].length - categories[a].length);

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

    const filteredDonations = selectedCategory ? categories[selectedCategory] || [] : donations;

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
                            <Package className="h-7 w-7 text-primary" /> Food Categories
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Browse available donations by food category</p>
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
                    <div className="mb-3 rounded-xl bg-muted p-3">
                        <Package className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No available donations</p>
                    <p className="mt-1 text-sm text-muted-foreground">Check back soon — donors list new items regularly.</p>
                </div>
            ) : (
                <>
                    {/* Category grid */}
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                        {/* All category card */}
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={cn(
                                "rounded-xl border p-4 text-left transition-all hover:shadow-soft",
                                !selectedCategory ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20" : "bg-card hover:bg-muted/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn("rounded-lg p-2", !selectedCategory ? "bg-primary/15" : "bg-muted")}>
                                    <Gift className={cn("h-5 w-5", !selectedCategory ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <span className="text-2xl font-bold text-foreground">{donations.length}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">All Items</p>
                            <p className="text-xs text-muted-foreground">{sortedCategories.length} categories</p>
                        </button>

                        {sortedCategories.map((cat) => {
                            const meta = categoryMeta[cat] || categoryMeta.other;
                            const Icon = meta.icon;
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(isSelected ? null : cat)}
                                    className={cn(
                                        "rounded-xl border p-4 text-left transition-all hover:shadow-soft",
                                        isSelected ? `${meta.bg} ring-2 ring-current/20` : "bg-card hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={cn("rounded-lg p-2", isSelected ? meta.bg : "bg-muted")}>
                                            <Icon className={cn("h-5 w-5", isSelected ? meta.color : "text-muted-foreground")} />
                                        </div>
                                        <span className="text-2xl font-bold text-foreground">{categories[cat].length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground capitalize">{meta.label}</p>
                                    <p className="text-xs text-muted-foreground">{categories[cat].length} item{categories[cat].length !== 1 ? "s" : ""}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filtered donations list */}
                    <div className="rounded-xl border bg-card p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                {selectedCategory ? (
                                    <>
                                        {(() => { const Icon = (categoryMeta[selectedCategory] || categoryMeta.other).icon; return <Icon className="h-5 w-5" />; })()}
                                        <span className="capitalize">{(categoryMeta[selectedCategory] || categoryMeta.other).label}</span>
                                    </>
                                ) : (
                                    <><Gift className="h-5 w-5 text-primary" /> All Available Donations</>
                                )}
                            </h3>
                            <span className="text-xs text-muted-foreground">{filteredDonations.length} item{filteredDonations.length !== 1 ? "s" : ""}</span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredDonations.map((d) => {
                                const isClaiming = claiming === d.id;
                                return (
                                    <div key={d.id} className="group rounded-xl border bg-background p-4 shadow-soft transition-all hover:shadow-medium">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <Badge variant="outline" className="text-xs capitalize bg-success/10 text-success border-success/30">
                                                Available
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
                                        <Button size="sm" className="mt-3 w-full h-8 text-xs" disabled={isClaiming} onClick={() => handleClaim(d)}>
                                            {isClaiming
                                                ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Claiming...</>
                                                : <><HandHeart className="mr-2 h-3 w-3" />Claim This Donation</>}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
