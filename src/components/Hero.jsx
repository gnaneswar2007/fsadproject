import { ArrowRight, BarChart3, Gift, Leaf, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden gradient-hero">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full opacity-40 blur-3xl" style={{ background: "hsl(var(--primary) / 0.15)" }} />
        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full opacity-40 blur-3xl" style={{ background: "hsl(var(--secondary) / 0.12)" }} />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: "hsl(var(--accent) / 0.12)" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in">
            <Leaf className="h-4 w-4" />
            <span>Fighting Food Waste Together</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <span className="text-gradient">Improve Food Security</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Connect surplus food with those who need it. FoodSecurity helps donors reduce waste, recipients access nutrition, and analysts track impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: "1s" }}>
          {[
            { icon: Users, value: "50K+", label: "Active Users" },
            { icon: Gift, value: "200+", label: "NGO Partners" },
            { icon: BarChart3, value: "30%", label: "Waste Reduced" },
            { icon: Leaf, value: "1M+", label: "kg CO₂ Saved" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center rounded-2xl border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-medium"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="mb-3 rounded-xl bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

