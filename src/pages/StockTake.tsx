import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ClipboardCheck, AlertTriangle, Check, X, Save } from "lucide-react";
import { StockTakeItem } from "@/types/inventory";
import { cn } from "@/lib/utils";

export default function StockTake() {
  const { products, updateProduct } = useProducts();
  const { addMovement } = useStockMovements();
  const [stockTake, setStockTake] = useState<Record<string, StockTakeItem>>({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Initialize stock take with all products
  const initializeStockTake = () => {
    const items: Record<string, StockTakeItem> = {};
    products.forEach((p) => {
      items[p.id] = {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        systemQuantity: p.quantity,
        countedQuantity: null,
        discrepancy: null,
        notes: "",
      };
    });
    setStockTake(items);
    setCompleted(false);
  };

  // Update counted quantity for a product
  const updateCount = (productId: string, count: string) => {
    const countNum = count === "" ? null : parseInt(count);
    setStockTake((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        countedQuantity: countNum,
        discrepancy: countNum !== null ? countNum - prev[productId].systemQuantity : null,
      },
    }));
  };

  // Calculate summary stats
  const summary = useMemo(() => {
    const items = Object.values(stockTake);
    const counted = items.filter((i) => i.countedQuantity !== null);
    const discrepancies = counted.filter((i) => i.discrepancy !== 0);
    const totalDiff = counted.reduce((sum, i) => sum + (i.discrepancy || 0), 0);
    
    return {
      total: items.length,
      counted: counted.length,
      discrepancies: discrepancies.length,
      totalDiff,
    };
  }, [stockTake]);

  // Save all adjustments
  const handleSave = async () => {
    setSaving(true);
    const itemsToAdjust = Object.values(stockTake).filter(
      (i) => i.countedQuantity !== null && i.discrepancy !== 0
    );

    let successCount = 0;
    for (const item of itemsToAdjust) {
      try {
        // Update product quantity
        await updateProduct.mutateAsync({
          id: item.productId,
          quantity: item.countedQuantity!,
          silent: true,
        });

        // Record stock movement
        await addMovement.mutateAsync({
          productId: item.productId,
          movementType: "stock_take",
          quantityChange: item.discrepancy!,
          quantityBefore: item.systemQuantity,
          notes: `Stock take adjustment${item.notes ? `: ${item.notes}` : ""}`,
        });

        successCount++;
      } catch (error) {
        console.error("Failed to adjust:", item.productName, error);
      }
    }

    setSaving(false);
    setCompleted(true);
    toast.success(`Stock take complete`, {
      description: `${successCount} adjustments saved`,
    });
  };

  // If no stock take started
  if (Object.keys(stockTake).length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4 py-12">
            <ClipboardCheck className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-2xl font-semibold">Stock Take</h1>
            <p className="text-muted-foreground">
              Count your physical inventory and reconcile with system records.
              Any discrepancies will be logged as stock adjustments.
            </p>
            <Button size="lg" onClick={initializeStockTake}>
              Start Stock Take
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Stock Take</h1>
            <p className="text-muted-foreground text-sm">
              Enter counted quantities for each product
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStockTake({});
                setCompleted(false);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || summary.counted === 0 || completed}
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save Adjustments"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary.counted}/{summary.total}</div>
              <div className="text-xs text-muted-foreground">Items Counted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className={cn("text-2xl font-bold", summary.discrepancies > 0 && "text-yellow-500")}>
                {summary.discrepancies}
              </div>
              <div className="text-xs text-muted-foreground">Discrepancies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className={cn(
                "text-2xl font-bold",
                summary.totalDiff > 0 && "text-green-500",
                summary.totalDiff < 0 && "text-red-500"
              )}>
                {summary.totalDiff > 0 ? "+" : ""}{summary.totalDiff}
              </div>
              <div className="text-xs text-muted-foreground">Net Difference</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {Math.round((summary.counted / summary.total) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </CardContent>
          </Card>
        </div>

        {/* Product List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {Object.values(stockTake).map((item) => (
                  <div
                    key={item.productId}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border",
                      item.discrepancy !== null && item.discrepancy !== 0
                        ? "border-yellow-500/50 bg-yellow-500/5"
                        : item.countedQuantity !== null
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">System</div>
                      <div className="font-medium">{item.systemQuantity}</div>
                    </div>
                    
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Count"
                        value={item.countedQuantity ?? ""}
                        onChange={(e) => updateCount(item.productId, e.target.value)}
                        min={0}
                        className="text-center"
                        disabled={completed}
                      />
                    </div>
                    
                    <div className="w-16 text-center">
                      {item.discrepancy !== null && (
                        <Badge
                          variant={item.discrepancy === 0 ? "secondary" : "destructive"}
                          className={cn(
                            item.discrepancy > 0 && "bg-green-500",
                            item.discrepancy === 0 && "bg-muted"
                          )}
                        >
                          {item.discrepancy > 0 ? "+" : ""}{item.discrepancy}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {completed && (
          <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-green-700">Stock take completed! All adjustments have been saved.</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
