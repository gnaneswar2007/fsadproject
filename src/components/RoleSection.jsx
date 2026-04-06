import { BarChart3, Building2, Gift, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: ShieldCheck,
    title: "Admin",
    description: "Oversee platform operations and manage users",
    color: "gradient-primary",
    features: ["User management", "Platform analytics", "Content moderation"],
  },
  {
    icon: Gift,
    title: "Donor",
    description: "Share surplus food with those in need",
    color: "bg-success",
    features: ["List food items", "Track donations", "Impact dashboard"],
  },
  {
    icon: Building2,
    title: "Recipient",
    description: "Access donated food for your organization",
    color: "bg-accent",
    features: ["Browse listings", "Request items", "Manage pickups"],
  },
  {
    icon: BarChart3,
    title: "Data Analyst",
    description: "Analyze donation patterns and community impact",
    color: "bg-info",
    features: ["View analytics", "Generate reports", "Track trends"],
  },
];

export function RoleSection() {
  return (
    <section id="about" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-medium text-secondary">
            For Everyone
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Choose Your Role
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're donating, receiving, or analyzing — there's a place for you in the fight against food waste.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn("rounded-xl p-3 text-primary-foreground", role.color)}>
                  <role.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {role.title}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {role.description}
                  </p>
                  <ul className="mb-6 grid grid-cols-2 gap-2">
                    {role.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Get Started as {role.title}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

