import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Gift, Loader2, MapPin, Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListDonationDialog } from "@/components/ListDonationDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const statusColors = {
  available: "bg-success/10 text-success border-success/30",
  claimed: "bg-info/10 text-info border-info/30",
  picked_up: "bg-primary/10 text-primary border-primary/30",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function DonationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    if (!user) return;
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const handleDelete = async (id) => {
    toast({ title: "Delete failed", description: "Database is no longer available", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Donations</h1>
          <p className="text-sm text-muted-foreground">List and manage your food donations</p>
        </div>
        <ListDonationDialog onSuccess={fetchDonations} triggerLabel="New Donation" />
      </div>

      {/* Donations list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <div className="mb-4 rounded-xl bg-primary/10 p-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No donations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "New Donation" to list your first surplus food item.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {donations.map((d) => (
            <div key={d.id} className="group rounded-2xl border bg-card p-5 shadow-soft transition-all hover:shadow-medium">
              <div className="mb-3 flex items-start justify-between">
                <Badge variant="outline" className={cn("text-xs capitalize", statusColors[d.status])}>
                  {d.status.replace("_", " ")}
                </Badge>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-foreground">{d.food_name}</h3>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">{d.category}</p>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5" />
                  <span>{d.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Expires {format(new Date(d.expiry_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{d.pickup_location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

