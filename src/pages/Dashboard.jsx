import { DashboardSidebar } from "@/components/DashboardSidebar";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import { DonationsPage } from "@/components/DonationsPage";
import { OrganizationsPage } from "@/components/OrganizationsPage";
import { AnalyticsPage } from "@/components/AnalyticsPage";
import { UsersPage } from "@/components/UsersPage";
import { SettingsPage } from "@/components/SettingsPage";
import { WasteAvoidedPage } from "@/components/WasteAvoidedPage";
import { MyClaimsPage } from "@/components/MyClaimsPage";
import { ExpiringSoonPage } from "@/components/ExpiringSoonPage";
import { CategoriesPage } from "@/components/CategoriesPage";
import { SuccessRatePage } from "@/components/SuccessRatePage";
import { ExpiredListingsPage } from "@/components/ExpiredListingsPage";
import { ActiveListingsPage } from "@/components/ActiveListingsPage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // user exists but role is still resolving — keep showing the spinner
  if (user && !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Setting up your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        userRole={role}
        userName={userName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className={cn("min-h-screen transition-all duration-300", "lg:ml-64")}>
        {/* Mobile topbar */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 backdrop-blur px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-foreground">FoodSecurity</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {location.pathname === "/dashboard/donations" ? (
            <DonationsPage />
          ) : location.pathname === "/dashboard/organizations" ? (
            <OrganizationsPage userRole={role} />
          ) : location.pathname === "/dashboard/analytics" ? (
            <AnalyticsPage />
          ) : location.pathname === "/dashboard/users" ? (
            <UsersPage />
          ) : location.pathname === "/dashboard/waste-avoided" ? (
            <WasteAvoidedPage />
          ) : location.pathname === "/dashboard/my-claims" ? (
            <MyClaimsPage />
          ) : location.pathname === "/dashboard/expiring-soon" ? (
            <ExpiringSoonPage />
          ) : location.pathname === "/dashboard/categories" ? (
            <CategoriesPage />
          ) : location.pathname === "/dashboard/success-rate" ? (
            <SuccessRatePage />
          ) : location.pathname === "/dashboard/expired-listings" ? (
            <ExpiredListingsPage />
          ) : location.pathname === "/dashboard/active-listings" ? (
            <ActiveListingsPage />
          ) : location.pathname === "/dashboard/settings" ? (
            <SettingsPage />
          ) : (
            <RoleBasedDashboard role={role} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

