import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { addDonation } from "@/lib/mock-db";

const categories = [
  { value: "bakery", label: "Bakery" },
  { value: "dairy", label: "Dairy" },
  { value: "produce", label: "Produce" },
  { value: "prepared", label: "Prepared Meals" },
  { value: "pantry", label: "Packaged Goods" },
  { value: "beverages", label: "Beverages" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  food_name: "",
  category: "produce",
  quantity: "",
  pickup_location: "",
  donor_phone: "",
  description: "",
};

/**
 * Reusable "List a Donation" dialog button.
 * @param {function} onSuccess - called after a donation is saved successfully
 * @param {string}   triggerLabel - button label (default: "List Surplus Food")
 * @param {string}   triggerVariant - shadcn button variant (default: "default")
 */
export function ListDonationDialog({
  onSuccess,
  triggerLabel = "List Surplus Food",
  triggerVariant = "default",
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expiryDate, setExpiryDate] = useState(undefined);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: typeof e === "string" ? e : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !expiryDate) return;
    if (!form.food_name.trim() || !form.quantity.trim() || !form.pickup_location.trim() || !form.donor_phone.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Read the donor's full name from the auth profile stored in localStorage
      const storedAuth = localStorage.getItem("mock_auth_user");
      const donorName = storedAuth ? (JSON.parse(storedAuth).profile?.full_name || user.email) : user.email;

      addDonation({
        food_name: form.food_name.trim(),
        category: form.category,
        quantity: form.quantity.trim(),
        expiry_date: expiryDate.toISOString(),
        pickup_location: form.pickup_location.trim(),
        description: form.description.trim(),
        donor_id: user.id,
        donor_name: donorName,
        donor_phone: form.donor_phone.trim(),
      });
      toast({ title: "Donation listed! 🎉", description: `${form.food_name} is now available for recipients.` });
      setForm(emptyForm);
      setExpiryDate(undefined);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast({ title: "Error saving donation", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>List a New Donation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Food name */}
          <div className="space-y-1.5">
            <Label htmlFor="ld-food_name">Food Name *</Label>
            <Input
              id="ld-food_name"
              placeholder="e.g. Fresh Bread Loaves"
              value={form.food_name}
              onChange={set("food_name")}
              maxLength={100}
              required
            />
          </div>

          {/* Category + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={set("category")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ld-quantity">Quantity *</Label>
              <Input
                id="ld-quantity"
                placeholder="e.g. 20 loaves"
                value={form.quantity}
                onChange={set("quantity")}
                maxLength={50}
                required
              />
            </div>
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <Label>Expiry Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Pickup location */}
          <div className="space-y-1.5">
            <Label htmlFor="ld-pickup_location">Pickup Location *</Label>
            <Input
              id="ld-pickup_location"
              placeholder="e.g. 123 Main St, Springfield"
              value={form.pickup_location}
              onChange={set("pickup_location")}
              maxLength={200}
              required
            />
          </div>

          {/* Donor phone number */}
          <div className="space-y-1.5">
            <Label htmlFor="ld-donor_phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ld-donor_phone"
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={form.donor_phone}
                onChange={set("donor_phone")}
                maxLength={15}
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ld-description">Description (optional)</Label>
            <Textarea
              id="ld-description"
              placeholder="Additional details about the food…"
              value={form.description}
              onChange={set("description")}
              maxLength={500}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving || !expiryDate}>
            {saving
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              : "List Donation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
