import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/inventory";
import { ScanMode } from "@/pages/QuickScan";
import { getStockStatus } from "@/lib/inventory";
import { StockBadge } from "@/components/StockBadge";
import { 
  Package, 
  Plus, 
  Minus, 
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionPanelProps {
  product: Product | null;
  barcode: string | null;
  scanMode: ScanMode;
  onStockIn: (amount: number) => Promise<void>;
  onStockOut: (amount: number) => Promise<void>;
  onQuickAdd: (name: string, category: string, quantity: number) => Promise<void>;
}

const PRESET_AMOUNTS = [1, 5, 10, 25];

export function QuickActionPanel({
  product,
  barcode,
  scanMode,
  onStockIn,
  onStockOut,
  onQuickAdd,
}: QuickActionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddCategory, setQuickAddCategory] = useState("General");
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    // Auto-focus quantity input when product is scanned
    if (product && (scanMode === "stock-in" || scanMode === "stock-out")) {
      setTimeout(() => quantityInputRef.current?.focus(), 100);
    }
  }, [product, scanMode]);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
      setQuantity(1); // Reset after action
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setQuantity(num);
    } else if (value === "") {
      setQuantity(0);
    }
  };

  const handlePresetClick = (amount: number) => {
    setQuantity(amount);
  };

  // Quick Add Form (for new products)
  if (scanMode === "add" && barcode && !product) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Quick Add Product</p>
              <p className="text-sm text-muted-foreground font-mono truncate">{barcode}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="quickName">Product Name *</Label>
              <Input
                id="quickName"
                placeholder="Enter product name"
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="quickCategory">Category</Label>
                <Input
                  id="quickCategory"
                  placeholder="e.g., Dairy"
                  value={quickAddCategory}
                  onChange={(e) => setQuickAddCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quickQty">Initial Quantity</Label>
                <Input
                  id="quickQty"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg"
            disabled={!quickAddName.trim() || isLoading}
            onClick={() => handleAction(async () => {
              await onQuickAdd(quickAddName, quickAddCategory, quantity);
              setQuickAddName("");
              setQuickAddCategory("General");
            })}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            Add Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No product scanned yet
  if (!product) {
    return (
      <Card className="animate-fade-in border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Scan a barcode to get started</p>
        </CardContent>
      </Card>
    );
  }

  const stockStatus = getStockStatus(product.quantity, product.minStock);
  const isStockIn = scanMode === "stock-in";
  const isStockOut = scanMode === "stock-out";
  const showQuantityInput = isStockIn || isStockOut;

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4 space-y-4">
        {/* Product Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-lg shrink-0">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{product.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{product.sku}</span>
              {product.barcode && (
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {product.barcode}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Current Stock</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{product.quantity}</span>
            <StockBadge status={stockStatus} quantity={product.quantity} />
          </div>
        </div>

        {/* Quantity Input for Stock In/Out */}
        {showQuantityInput && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="stockQty" className="text-xs text-muted-foreground font-medium">
                {isStockIn ? "QUANTITY TO ADD" : "QUANTITY TO REMOVE"}
              </Label>
              <div className="flex gap-2">
                <Input
                  ref={quantityInputRef}
                  id="stockQty"
                  type="number"
                  min="1"
                  max={isStockOut ? product.quantity : undefined}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className={cn(
                    "text-center text-2xl font-bold h-14 flex-1",
                    isStockIn && "focus:border-success focus-visible:ring-success",
                    isStockOut && "focus:border-danger focus-visible:ring-danger"
                  )}
                />
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={quantity === amount ? "default" : "outline"}
                  size="sm"
                  className="h-10"
                  onClick={() => handlePresetClick(amount)}
                  disabled={isStockOut && amount > product.quantity}
                >
                  {amount}
                </Button>
              ))}
            </div>

            {/* Confirm Button */}
            <Button
              className={cn(
                "w-full h-14 text-lg font-semibold",
                isStockIn && "bg-success hover:bg-success/90",
                isStockOut && "bg-danger hover:bg-danger/90"
              )}
              disabled={isLoading || quantity < 1 || (isStockOut && quantity > product.quantity)}
              onClick={() => handleAction(async () => {
                if (isStockIn) {
                  await onStockIn(quantity);
                } else {
                  await onStockOut(quantity);
                }
              })}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : isStockIn ? (
                <Plus className="h-5 w-5 mr-2" />
              ) : (
                <Minus className="h-5 w-5 mr-2" />
              )}
              {isStockIn ? `Add ${quantity}` : `Remove ${quantity}`}
            </Button>

            {isStockOut && quantity > product.quantity && (
              <p className="text-xs text-danger text-center">
                Cannot remove more than available stock
              </p>
            )}
          </div>
        )}

        {/* Lookup Mode - Show both options */}
        {scanMode === "lookup" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 hover:bg-success/10 hover:text-success hover:border-success"
                onClick={() => handleAction(() => onStockIn(1))}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                +1 Stock
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:bg-danger/10 hover:text-danger hover:border-danger"
                onClick={() => handleAction(() => onStockOut(1))}
                disabled={isLoading || product.quantity < 1}
              >
                <Minus className="h-4 w-4 mr-1" />
                -1 Stock
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
