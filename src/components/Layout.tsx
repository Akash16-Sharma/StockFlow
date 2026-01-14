import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, LayoutDashboard, ScanBarcode, LogOut, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useNotifications } from "@/contexts/NotificationContext";
import { AdminNavigation } from "@/components/AdminNavigation";
import { TrialBanner } from "@/components/TrialBanner";
import { PlanBadge } from "@/components/PlanBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_DISPLAY_NAMES } from "@/lib/plans";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scan', icon: ScanBarcode, label: 'Scan' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { plan, isTrialing, trialDaysRemaining, isLoading: subscriptionLoading } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {/* Trial Banner */}
      {!subscriptionLoading && isTrialing && (
        <TrialBanner 
          daysRemaining={trialDaysRemaining} 
          planName={PLAN_DISPLAY_NAMES[plan]} 
        />
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="p-1.5 bg-primary rounded-lg">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>StockFlow</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <AdminNavigation variant="desktop" />
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
            />
            <div className="hidden md:flex items-center gap-2">
              <PlanBadge plan={plan} size="sm" />
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <Button
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container py-4 md:py-6">
        {children}
      </main>
      
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <AdminNavigation variant="mobile" />
          <Link
            to="/settings"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              location.pathname === "/settings"
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
