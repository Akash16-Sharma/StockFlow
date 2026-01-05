import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

const variantStyles = {
  default: 'bg-secondary text-secondary-foreground',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
};

export function StatCard({ title, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <Card className="animate-fade-in group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-lg transition-transform group-hover:scale-105",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
