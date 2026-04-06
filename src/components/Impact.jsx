import { BarChart3, Heart, Leaf, TrendingDown } from "lucide-react";

const impacts = [
  {
    icon: TrendingDown,
    value: "50K+",
    label: "Meals Donated",
    description: "Surplus food diverted from landfills to families in need",
    color: "text-success",
  },
  {
    icon: Heart,
    value: "200+",
    label: "Organizations",
    description: "NGOs and food banks connected through our platform",
    color: "text-accent",
  },
  {
    icon: Leaf,
    value: "30%",
    label: "Waste Reduced",
    description: "Overall food waste reduction in partnered communities",
    color: "text-primary",
  },
  {
    icon: BarChart3,
    value: "1000T",
    label: "CO₂ Saved",
    description: "Carbon emissions prevented through food waste reduction",
    color: "text-info",
  },
];

export function Impact() {
  return (
    <section id="impact" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Our Impact
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Making a Real Difference
          </h2>
          <p className="text-lg text-muted-foreground">
            Every donation counts. Together, we're building a more food-secure world while protecting our environment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {impacts.map((impact, index) => {
            const Icon = impact.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-medium transition-all"
              >
                <div className={`mb-4 inline-flex items-center justify-center rounded-lg bg-muted p-3`}>
                  <Icon className={`h-6 w-6 ${impact.color}`} />
                </div>

                <div className="mb-2">
                  <p className="text-3xl font-bold text-foreground">{impact.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{impact.label}</p>
                </div>

                <p className="text-sm text-muted-foreground">{impact.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Join the Movement</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You can be part of the solution. Whether as a donor, recipient, or analyst, your contribution matters in the fight against food waste and hunger.
          </p>
        </div>
      </div>
    </section>
  );
}
