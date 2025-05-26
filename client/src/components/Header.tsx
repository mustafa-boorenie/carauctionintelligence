import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { logOut } from "@/lib/firebase";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
      setLocation("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getTrialDaysLeft = () => {
    if (!user?.trialEndDate) return 0;
    const end = new Date(user.trialEndDate);
    const now = new Date();
    return Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-car text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-slate-900">
              Car Auction AI
            </span>
          </Link>

          {/* Navigation - Hidden for cleaner mobile-like design */}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Trial Status */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <i className="fas fa-clock text-emerald-500"></i>
                  <span>{getTrialDaysLeft()} days trial left</span>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback>
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {user.displayName || user.email}
                      </span>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fas fa-user mr-2"></i>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fas fa-credit-card mr-2"></i>
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => setLocation("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => setLocation("/auth")}>
                  Start Free Trial
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
