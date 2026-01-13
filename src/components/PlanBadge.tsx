import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Building2 } from "lucide-react";
import { PlanType, PLAN_DISPLAY_NAMES } from "@/lib/plans";

interface PlanBadgeProps {
  plan: PlanType;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function PlanBadge({ plan, showIcon = true, size = "default" }: PlanBadgeProps) {
  const config = {
    starter: {
      icon: Sparkles,
      className: "bg-muted text-muted-foreground",
    },
    professional: {
      icon: Crown,
      className: "bg-primary/10 text-primary border-primary/20",
    },
    enterprise: {
      icon: Building2,
      className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  };

  const { icon: Icon, className } = config[plan];

  return (
    <Badge 
      variant="outline" 
      className={`${className} ${size === "sm" ? "text-xs px-1.5 py-0" : ""}`}
    >
      {showIcon && <Icon className={`${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} mr-1`} />}
      {PLAN_DISPLAY_NAMES[plan]}
    </Badge>
  );
}
