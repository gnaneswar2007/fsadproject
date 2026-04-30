import { BarChart3, Building2, Gift, Shield, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Gift,
    title: "Easy Donation",
    description: "List and donate surplus food with just a few clicks through our intuitive platform.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "NGO Partnership",
    description: "Connect directly with verified NGOs and food banks to maximize your impact.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: TrendingDown,
    title: "Waste Reduction",
    description: "Track and reduce food waste with real-time impact metrics and analytics.",
    color: "bg-info/10 text-info",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "AI-powered insights help predict surplus and optimize food resource management.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with like-minded organizations and individuals committed to food security.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Built-in safety guidelines ensure all donated food meets health standards.",
    color: "bg-warning/10 text-warning",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            How It Works
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            A Complete Platform for Food Security
          </h2>
          <p className="text-lg text-muted-foreground">
            From donation to distribution, we provide all the tools you need to make a real impact.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("mb-4 inline-flex rounded-xl p-3 transition-transform duration-300 group-hover:scale-110", feature.color)}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

