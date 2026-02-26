import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  secondary: "bg-secondary/10 border-secondary/20",
  accent: "bg-accent/5 border-accent/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/20 text-secondary",
  accent: "bg-accent/10 text-accent",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-6 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

