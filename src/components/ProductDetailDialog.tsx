import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { StockBadge } from "@/components/StockBadge";
import { ExpiryBadge } from "@/components/ExpiryBadge";
import { PrintDialog } from "@/components/PrintDialog";
import { Product } from "@/types/inventory";
import { getStockStatus, getExpiryStatus, formatDate } from "@/lib/inventory";
import { Package, Barcode, QrCode, Calendar, Boxes, Tag, Printer } from "lucide-react";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const [showPrint, setShowPrint] = useState(false);

  if (!product) return null;

  const stockStatus = getStockStatus(product.quantity, product.minStock);
  const expiryStatus = getExpiryStatus(product.expiryDate);
  const barcodeValue = product.barcode || product.sku;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-secondary rounded-lg">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="truncate">{product.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>SKU</span>
            </div>
            <span className="font-medium">{product.sku}</span>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Boxes className="h-4 w-4" />
              <span>Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{product.quantity}</span>
              <StockBadge status={stockStatus} quantity={product.quantity} />
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expiry</span>
            </div>
            <div>
              {product.expiryDate ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatDate(product.expiryDate)}</span>
                  <ExpiryBadge expiryDate={product.expiryDate} status={expiryStatus} />
                </div>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          {/* Barcode Display */}
          <div className="border rounded-lg p-4 space-y-3">
            <Tabs defaultValue="barcode" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="barcode" className="flex items-center gap-1.5">
                  <Barcode className="h-4 w-4" />
                  Barcode
                </TabsTrigger>
                <TabsTrigger value="qrcode" className="flex items-center gap-1.5">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </TabsTrigger>
              </TabsList>
              <TabsContent value="barcode" className="mt-3">
                <BarcodeDisplay 
                  value={barcodeValue} 
                  format="CODE128"
                  height={60}
                />
              </TabsContent>
              <TabsContent value="qrcode" className="mt-3">
                <QRCodeDisplay 
                  value={barcodeValue}
                  size={150}
                />
              </TabsContent>
            </Tabs>
            <p className="text-center text-xs text-muted-foreground">
              {product.barcode ? `Barcode: ${product.barcode}` : `Using SKU: ${product.sku}`}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => setShowPrint(true)} className="flex-1">
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>

      <PrintDialog
        products={[product]}
        open={showPrint}
        onOpenChange={setShowPrint}
      />
    </Dialog>
  );
}
