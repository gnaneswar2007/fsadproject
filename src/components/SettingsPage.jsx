import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, User, Building2, Mail, Shield, LogOut,
  Loader2, Save, CheckCircle2,
} from "lucide-react";
import { signOut } from "@/lib/mock-auth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const roleInfo = {
  admin:     { label: "Admin",     description: "Full platform access — manage users, donations, and analytics.", color: "bg-primary/10 text-primary border-primary/20" },
  donor:     { label: "Donor",     description: "List surplus food donations and track their status.", color: "bg-success/10 text-success border-success/20" },
  recipient: { label: "Recipient", description: "Browse available donations and schedule pickups.", color: "bg-accent/10 text-accent border-accent/20" },
  analyst:   { label: "Analyst",   description: "View platform analytics and generate reports.", color: "bg-info/10 text-info border-info/20" },
};

export function SettingsPage() {
  const { user, role } = useAuth();
  const { toast }      = useToast();
  const navigate       = useNavigate();
  const [profile, setProfile]   = useState({ full_name: "", organization_name: "" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // Load profile
  useEffect(() => {
    if (!user) return;
    // Mock profile is stored in localStorage
    const stored = localStorage.getItem("mock_auth_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile({ 
          full_name: parsed.profile?.full_name || "", 
          organization_name: parsed.profile?.organization_name || "" 
        });
      } catch {}
    }
    setLoading(false);
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Update mock auth with new profile data
    try {
      const stored = localStorage.getItem("mock_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.profile = {
          full_name: profile.full_name,
          organization_name: profile.organization_name
        };
        localStorage.setItem("mock_auth_user", JSON.stringify(parsed));
      }
      setSaved(true);
      toast({ title: "Profile saved", description: "Your profile has been updated." });
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const info = roleInfo[role] || roleInfo.donor;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account preferences</p>
      </div>

      {/* Account overview */}
      <div className="rounded-xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {(profile.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{profile.full_name || "Unnamed User"}</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Role info */}
      <div className={cn("rounded-xl border p-5", info.color)}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4" />
          <h3 className="font-semibold">Your Role: {info.label}</h3>
        </div>
        <p className="text-sm">{info.description}</p>
      </div>

      {/* Profile form */}
      <div className="rounded-xl border bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-foreground mb-5">
          <User className="h-5 w-5 text-primary" />Edit Profile
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Organization Name</span>
              </label>
              <input
                type="text"
                value={profile.organization_name}
                onChange={(e) => setProfile((p) => ({ ...p, organization_name: e.target.value }))}
                placeholder="Your organization (optional)"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border bg-muted px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="pt-1">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : saved ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" />Saved!</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Changes</>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-foreground mb-2">
          <LogOut className="h-5 w-5 text-destructive" />Sign Out
        </h2>
        <p className="text-sm text-muted-foreground mb-4">You'll be returned to the login screen.</p>
        <Button variant="destructive" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />Sign Out
        </Button>
      </div>
    </div>
  );
}
