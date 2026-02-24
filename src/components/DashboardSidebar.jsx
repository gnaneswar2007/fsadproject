import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  Gift,
  Home,
  Leaf,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "@/lib/mock-auth";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Donations", icon: Gift, href: "/dashboard/donations", roles: ["admin", "donor"] },
  { label: "Organizations", icon: Building2, href: "/dashboard/organizations", roles: ["admin", "recipient"] },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", roles: ["admin", "analyst"] },
  { label: "Users", icon: Users, href: "/dashboard/users", roles: ["admin"] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function DashboardSidebar({
  userRole = "admin",
  userName = "User",
  isOpen = false,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const roleColors= {
    admin: "bg-primary/10 text-primary",
    donor: "bg-success/10 text-success",
    recipient: "bg-accent/10 text-accent",
    analyst: "bg-info/10 text-info",
  };

  const roleLabels = {
    admin: "Admin",
    donor: "Donor",
    recipient: "Recipient",
    analyst: "Analyst",
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300",
        // Desktop: always visible; Mobile: slide in/out
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">FoodSecurity</h1>
              <p className="text-xs text-muted-foreground">Reduce Waste, Feed More</p>
            </div>
          </Link>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", roleColors[userRole])}>
                <ShieldCheck className="h-3 w-3" />
                {roleLabels[userRole] || userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

