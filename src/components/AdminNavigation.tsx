import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRoles } from "@/hooks/useUserRoles";

interface AdminNavigationProps {
  variant: "desktop" | "mobile";
}

export function AdminNavigation({ variant }: AdminNavigationProps) {
  const location = useLocation();
  const { isAdmin, isAdminLoading } = useUserRoles();

  if (isAdminLoading || !isAdmin) return null;

  if (variant === "desktop") {
    return (
      <Link
        to="/admin/users"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          location.pathname === "/admin/users"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Users className="h-4 w-4" />
        Users
      </Link>
    );
  }

  return (
    <Link
      to="/admin/users"
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
        location.pathname === "/admin/users"
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Users className="h-5 w-5" />
      <span className="text-[10px] font-medium">Users</span>
    </Link>
  );
}
