import { Link } from "react-router-dom";
import { ScanBarcode, Plus, ClipboardCheck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  variant?: "default" | "primary" | "success" | "warning";
}

function QuickActionCard({ href, icon: Icon, label, description, variant = "default" }: QuickActionProps) {
  const variantClasses = {
    default: "bg-card hover:bg-accent border-border",
    primary: "bg-primary/5 hover:bg-primary/10 border-primary/20",
    success: "bg-success/5 hover:bg-success/10 border-success/20",
    warning: "bg-warning/5 hover:bg-warning/10 border-warning/20",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        variantClasses[variant]
      )}
    >
      <div className={cn("p-2 rounded-lg bg-background/80 mb-2", iconClasses[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium text-sm">{label}</span>
      <span className="text-xs text-muted-foreground text-center mt-0.5">{description}</span>
    </Link>
  );
}

export function DashboardQuickActions() {
  return (
    <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
      <h2 className="font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionCard
          href="/scan"
          icon={ScanBarcode}
          label="Quick Scan"
          description="Scan & update stock"
          variant="primary"
        />
        <QuickActionCard
          href="/add"
          icon={Plus}
          label="Add Product"
          description="New inventory item"
          variant="success"
        />
        <QuickActionCard
          href="/stock-take"
          icon={ClipboardCheck}
          label="Stock Take"
          description="Physical count"
          variant="warning"
        />
        <QuickActionCard
          href="/products"
          icon={Package}
          label="All Products"
          description="View inventory"
        />
      </div>
    </section>
  );
}
