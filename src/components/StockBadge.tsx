import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/types/inventory";

interface StockBadgeProps {
  status: StockStatus;
  quantity: number;
}

const statusConfig: Record<StockStatus, { label: string; variant: "success" | "warning" | "danger" | "secondary" }> = {
  healthy: { label: 'In Stock', variant: 'success' },
  low: { label: 'Low Stock', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
  out: { label: 'Out of Stock', variant: 'danger' },
};

export function StockBadge({ status, quantity }: StockBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <span>{quantity}</span>
      <span className="opacity-70">·</span>
      <span>{config.label}</span>
    </Badge>
  );
}
