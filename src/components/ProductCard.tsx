import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/inventory";
import { StockBadge } from "./StockBadge";
import { ExpiryBadge } from "./ExpiryBadge";
import { getStockStatus, getExpiryStatus } from "@/lib/inventory";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const stockStatus = getStockStatus(product.quantity, product.minStock);
  const expiryStatus = getExpiryStatus(product.expiryDate);
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-secondary rounded-lg shrink-0">
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
  );
}
