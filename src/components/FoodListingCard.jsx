import { cn } from "@/lib/utils";
import { Clock, MapPin, Package } from "lucide-react";
import { Button } from "./ui/button";

const categoryColors= {
  produce: "bg-success/10 text-success",
  dairy: "bg-info/10 text-info",
  bakery: "bg-warning/10 text-warning",
  prepared: "bg-accent/10 text-accent",
  pantry: "bg-primary/10 text-primary",
};

export function FoodListingCard({
  title,
  donor,
  quantity,
  expiresIn,
  location,
  category,
  imageUrl,
  onClaim,
  className,
}) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border bg-card shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1 animate-fade-in",
        className
      )}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize",
            categoryColors[category] || categoryColors.pantry
          )}
        >
          {category}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">From {donor}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span>{quantity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{expiresIn}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <Button
          onClick={onClaim}
          className="mt-4 w-full"
          variant="default"
        >
          Request Pickup
        </Button>
      </div>
    </div>
  );
}

