import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanHistoryItem } from "@/pages/QuickScan";
import { 
  Plus, 
  Minus, 
  Search, 
  ScanBarcode,
  Undo2,
  Package,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ScanHistoryListProps {
  history: ScanHistoryItem[];
  onUndo: (item: ScanHistoryItem) => void;
}

function getActionIcon(action: string) {
  switch (action) {
    case "stock-in":
      return <Plus className="h-4 w-4 text-success" />;
    case "stock-out":
      return <Minus className="h-4 w-4 text-danger" />;
    case "lookup":
      return <Search className="h-4 w-4 text-primary" />;
    case "add":
      return <ScanBarcode className="h-4 w-4 text-primary" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

function getActionLabel(action: string, quantity?: number) {
  switch (action) {
    case "stock-in":
      return `+${quantity || 1} added`;
    case "stock-out":
      return `-${quantity || 1} removed`;
    case "lookup":
      return "Viewed";
    case "add":
      return "Added new";
    default:
      return action;
  }
}

export function ScanHistoryList({ history, onUndo }: ScanHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card className="animate-fade-in border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No scan history yet</p>
          <p className="text-xs mt-1">Scanned items will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="divide-y">
            {history.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 flex items-center gap-3",
                  item.undone && "opacity-50 bg-muted/50"
                )}
              >
                {/* Action Icon */}
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  item.action === "stock-in" && "bg-success/10",
                  item.action === "stock-out" && "bg-danger/10",
                  item.action === "lookup" && "bg-primary/10",
                  item.action === "add" && "bg-primary/10"
                )}>
                  {getActionIcon(item.action)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      item.undone && "line-through"
                    )}>
                      {item.product?.name || "Unknown Product"}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      item.action === "stock-in" && "bg-success/10 text-success",
                      item.action === "stock-out" && "bg-danger/10 text-danger",
                      item.action === "lookup" && "bg-primary/10 text-primary",
                      item.action === "add" && "bg-primary/10 text-primary"
                    )}>
                      {getActionLabel(item.action, item.quantityChange)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{item.barcode}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Undo Button */}
                {(item.action === "stock-in" || item.action === "stock-out") && 
                  !item.undone && item.product && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => onUndo(item)}
                    title="Undo this action"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
