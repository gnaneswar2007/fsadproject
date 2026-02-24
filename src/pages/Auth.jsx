import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Eye, EyeOff, ArrowLeft, ShieldCheck, Gift, Building2, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, signUp, AppRole } from "@/lib/mock-auth";
import { useToast } from "@/hooks/use-toast";

// ── Personal admin email — always gets admin role ─────────────────────────────
const SUPER_ADMIN_EMAIL = "ganesh@gmail.com";

const roles = [
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description: "Manage the platform and users",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
  {
    value: "donor",
    label: "Donor",
    icon: Gift,
    description: "Donate surplus food to help others",
    color: "text-success",
    bg: "bg-success/10 border-success/30",
  },
  {
    value: "recipient",
    label: "Recipient",
    icon: Building2,
    description: "Receive food donations for your organization",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30",
  },
  {
    value: "analyst",
    label: "Analyst",
    icon: BarChart3,
    description: "Analyze donation patterns and impact",
    color: "text-info",
    bg: "bg-info/10 border-info/30",
  },
];

const demoAccounts = [
  {
    role: "admin",
    label: "Admin",
    email: "demo.admin@foodsaver.app",
    password: "demo1234",
    icon: ShieldCheck,
    color: "text-primary",
    bg: "bg-primary/10 hover:border-primary/40",
    badge: "bg-primary/10 text-primary",
    description: "Full platform control",
    capabilities: ["Approve donors & recipients", "View all donations", "Manage users & roles"],
  },
  {
    role: "donor",
    label: "Donor",
    email: "demo.donor@foodsaver.app",
    password: "demo1234",
    icon: Gift,
    color: "text-success",
    bg: "bg-success/10 hover:border-success/40",
    badge: "bg-success/10 text-success",
    description: "List surplus food",
    capabilities: ["Post food donations", "Track claim status", "See your impact stats"],
  },
  {
    role: "recipient",
    label: "Recipient",
    email: "demo.recipient@foodsaver.app",
    password: "demo1234",
    icon: Building2,
    color: "text-accent",
    bg: "bg-accent/10 hover:border-accent/40",
    badge: "bg-accent/10 text-accent",
    description: "Claim available food",
    capabilities: ["Browse available donations", "Claim & schedule pickups", "Track received food"],
  },
  {
    role: "analyst",
    label: "Analyst",
    email: "demo.analyst@foodsaver.app",
    password: "demo1234",
    icon: BarChart3,
    color: "text-info",
    bg: "bg-info/10 hover:border-info/40",
    badge: "bg-info/10 text-info",
    description: "Track waste & trends",
    capabilities: ["Donation trend charts", "Category breakdown", "Export impact reports"],
  },
];

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    organizationName: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // redirect already-authenticated users straight to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDemoLogin = async (account) => {
    setDemoLoading(account.role);
    try {
      const { data, error } = await signIn(account.email, account.password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: `Signed in as ${account.label}`, description: `Welcome to the ${account.label} dashboard!` });
        // Small delay to allow localStorage to persist
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      toast({ title: "Login failed", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setDemoLoading(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signIn(form.email, form.password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back", description: "Successfully signed in." });
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast({ title: "Full name required", description: "Please enter your full name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const effectiveRole = form.email.toLowerCase() === SUPER_ADMIN_EMAIL ? "admin" : selectedRole;

      const { data, error } = await signUp(
        form.email,
        form.password,
        effectiveRole,
        form.fullName,
        form.organizationName || undefined
      );
      if (error) {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Welcome! You're now signed in." });
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      toast({ title: "Registration failed", description: err.message || "Could not create account", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col lg:flex-row">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 gradient-primary relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FoodSecurity</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Together We Can End<br />Food Waste
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join thousands of donors, organizations, and analysts working to reduce food waste and improve food security.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "50K+", label: "Meals Donated" },
              { value: "200+", label: "Organizations" },
              { value: "30%", label: "Waste Reduced" },
              { value: "1000T", label: "CO₂ Saved" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} FoodSecurity. All rights reserved.
        </p>
      </div>

      {/* Right Panel – Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">FoodSecurity</span>
        </div>

        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Tabs */}
          <div className="mb-8 flex rounded-xl bg-muted p-1">
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200",
                mode === "login"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200",
                mode === "signup"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Sign in to your FoodSecurity account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">
                  Create one
                </button>
              </p>

              {/* Demo Accounts */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">Try a demo account</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleDemoLogin(account)}
                      disabled={demoLoading !== null}
                      className={cn(
                        "group flex flex-col gap-2 rounded-xl border-2 border-border p-3 text-left transition-all duration-200 disabled:opacity-60",
                        account.bg
                      )}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {demoLoading === account.role ? (
                            <Loader2 className={`h-4 w-4 animate-spin ${account.color}`} />
                          ) : (
                            <account.icon className={`h-4 w-4 ${account.color}`} />
                          )}
                          <span className="text-sm font-bold text-foreground">{account.label}</span>
                        </div>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", account.badge)}>
                          demo
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground">{account.description}</p>

                      {/* Capabilities */}
                      <ul className="space-y-0.5">
                        {account.capabilities.map((cap) => (
                          <li key={cap} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className={cn("h-1 w-1 rounded-full shrink-0", account.color.replace("text-", "bg-"))} />
                            {cap}
                          </li>
                        ))}
                      </ul>

                      <p className={cn("mt-1 text-[10px] font-medium", account.color)}>
                        {demoLoading === account.role ? "Signing in…" : "Click to try →"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                <p className="text-sm text-muted-foreground">Choose your role and join the FoodSecurity community</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Your Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                        selectedRole === role.value
                          ? role.bg + " shadow-soft"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("flex items-center gap-1.5", selectedRole === role.value ? role.color : "text-muted-foreground")}>
                        <role.icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{role.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {(selectedRole === "recipient" || selectedRole === "analyst") && (
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      placeholder="Community Food Bank"
                      value={form.organizationName}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="signupEmail">Email address</Label>
                  <Input
                    id="signupEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

