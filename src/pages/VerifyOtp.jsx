import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resendSignupOtp, verifySignupOtp } from "@/lib/mock-auth";

function readEmailFromLocation(search) {
  const params = new URLSearchParams(search || "");
  return (params.get("email") || "").trim();
}

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email] = useState(() => readEmailFromLocation(location.search));
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email missing", description: "Please start signup again.", variant: "destructive" });
      return;
    }

    if (!otp.trim()) {
      toast({ title: "OTP required", description: "Enter the OTP sent to your email.", variant: "destructive" });
      return;
    }

    if (!/^\d{4}$/.test(otp.trim())) {
      toast({ title: "Invalid OTP", description: "Please enter a valid 4-digit OTP.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await verifySignupOtp(email, otp.trim());
      if (error) {
        toast({ title: "Verification failed", description: error.message, variant: "destructive" });
        return;
      }

      if (data?.requiresLogin) {
        toast({ title: "OTP verified", description: "Account verified. Please sign in." });
        navigate("/auth");
        return;
      }

      toast({ title: "Account verified", description: "Please sign in to continue." });
      navigate("/auth");
    } catch (err) {
      toast({ title: "Verification failed", description: err.message || "Could not verify OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({ title: "Email missing", description: "Please start signup again.", variant: "destructive" });
      return;
    }

    setResending(true);
    try {
      const { error } = await resendSignupOtp(email);
      if (error) {
        toast({ title: "Resend failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "OTP resent", description: "A new OTP has been sent to your email." });
      }
    } catch (err) {
      toast({ title: "Resend failed", description: err.message || "Could not resend OTP", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card/95 p-6 shadow-medium backdrop-blur">
        <Link to="/auth" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {email || "No email found"}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              placeholder="4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : "Verify OTP"}
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={handleResend} disabled={resending || !email}>
            {resending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resending…</> : "Resend OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
