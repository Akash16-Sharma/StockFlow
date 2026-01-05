import { useStockMovements } from "@/hooks/useStockMovements";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, ClipboardCheck, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MovementType } from "@/types/inventory";

interface StockMovementHistoryProps {
  productId?: string;
  maxHeight?: string;
}

const movementConfig: Record<MovementType, { icon: typeof ArrowUpCircle; label: string; color: string }> = {
  stock_in: { icon: ArrowUpCircle, label: "Stock In", color: "text-green-500" },
  stock_out: { icon: ArrowDownCircle, label: "Stock Out", color: "text-red-500" },
  adjustment: { icon: RefreshCw, label: "Adjustment", color: "text-blue-500" },
  stock_take: { icon: ClipboardCheck, label: "Stock Take", color: "text-purple-500" },
  initial: { icon: Package, label: "Initial Stock", color: "text-muted-foreground" },
};

export function StockMovementHistory({ productId, maxHeight = "300px" }: StockMovementHistoryProps) {
  const { movements, isLoading } = useStockMovements(productId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No stock movements recorded</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-2 pr-4">
        {movements.map((movement) => {
          const config = movementConfig[movement.movementType];
          const Icon = config.icon;
          const isPositive = movement.quantityChange > 0;

          return (
            <div
              key={movement.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={cn("flex-shrink-0", config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{config.label}</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {isPositive ? "+" : ""}{movement.quantityChange}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{movement.quantityBefore} → {movement.quantityAfter}</span>
                  {movement.notes && (
                    <>
                      <span>•</span>
                      <span className="truncate">{movement.notes}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(movement.createdAt), { addSuffix: true })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
