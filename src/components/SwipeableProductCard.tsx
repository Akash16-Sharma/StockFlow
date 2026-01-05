import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/inventory";
import { StockBadge } from "./StockBadge";
import { ExpiryBadge } from "./ExpiryBadge";
import { getStockStatus, getExpiryStatus } from "@/lib/inventory";
import { Package, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableProductCardProps {
  product: Product;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 160;

export function SwipeableProductCard({ 
  product, 
  onClick, 
  onEdit, 
  onDelete 
}: SwipeableProductCardProps) {
  const stockStatus = getStockStatus(product.quantity, product.minStock);
  const expiryStatus = getExpiryStatus(product.expiryDate);
  
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
  }, [translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const diff = e.touches[0].clientX - startX.current;
    const newTranslate = Math.max(-ACTION_WIDTH, Math.min(0, currentX.current + diff));
    setTranslateX(newTranslate);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (translateX < -SWIPE_THRESHOLD) {
      setTranslateX(-ACTION_WIDTH);
    } else {
      setTranslateX(0);
    }
  }, [translateX]);

  const closeSwipe = useCallback(() => {
    setTranslateX(0);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action buttons behind the card */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={() => {
            closeSwipe();
            onEdit?.();
          }}
          className="w-20 bg-primary flex items-center justify-center text-primary-foreground transition-transform active:scale-95"
          aria-label="Edit product"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            closeSwipe();
            onDelete?.();
          }}
          className="w-20 bg-danger flex items-center justify-center text-danger-foreground transition-transform active:scale-95"
          aria-label="Delete product"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Swipeable card */}
      <Card 
        ref={cardRef}
        className={cn(
          "relative z-10 cursor-pointer bg-card transition-shadow",
          isDragging ? "" : "transition-transform duration-200",
          "hover:shadow-md active:shadow-sm"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (translateX !== 0) {
            closeSwipe();
          } else {
            onClick?.();
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary rounded-lg shrink-0 transition-transform group-active:scale-95">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.sku}</p>
                </div>
                <StockBadge status={stockStatus} quantity={product.quantity} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  {product.category}
                </span>
                <ExpiryBadge expiryDate={product.expiryDate} status={expiryStatus} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
