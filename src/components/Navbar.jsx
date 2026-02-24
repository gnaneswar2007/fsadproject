import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/mock-auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Impact", href: "#impact" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Check if we're already on the home page
    if (window.location.pathname === "/") {
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to home
      navigate("/");
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">FoodSecurity</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            {!loading && (
              user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "absolute left-0 right-0 top-16 border-b bg-background p-4 transition-all duration-300 lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2">
          {!loading && (
            user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Button className="w-full" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}

