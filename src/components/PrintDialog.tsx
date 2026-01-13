import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/inventory";
import { printLabels, PrintCodeType } from "@/lib/print";
import { Printer, Barcode, QrCode } from "lucide-react";

interface PrintDialogProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintDialog({ products, open, onOpenChange }: PrintDialogProps) {
  const [codeType, setCodeType] = useState<PrintCodeType>("barcode");
  const [labelsPerRow, setLabelsPerRow] = useState("3");

  const handlePrint = () => {
    printLabels({
      products,
      codeType,
      labelsPerRow: parseInt(labelsPerRow),
    });
    onOpenChange(false);
  };

  const productCount = products.length;
  const isBulk = productCount > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print {isBulk ? `${productCount} Labels` : "Label"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Code Type Selection */}
          <div className="space-y-2">
            <Label>Label Type</Label>
            <RadioGroup
              value={codeType}
              onValueChange={(value) => setCodeType(value as PrintCodeType)}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="barcode"
                className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  codeType === "barcode" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="barcode" id="barcode" className="sr-only" />
                <Barcode className="h-4 w-4" />
                <span className="text-sm font-medium">Barcode</span>
              </Label>
              <Label
                htmlFor="qrcode"
                className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  codeType === "qrcode" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="qrcode" id="qrcode" className="sr-only" />
                <QrCode className="h-4 w-4" />
                <span className="text-sm font-medium">QR Code</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Layout Selection (only for bulk) */}
          {isBulk && (
            <div className="space-y-2">
              <Label>Labels per Row</Label>
              <Select value={labelsPerRow} onValueChange={setLabelsPerRow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 per row</SelectItem>
                  <SelectItem value="3">3 per row</SelectItem>
                  <SelectItem value="4">4 per row</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview info */}
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
            {isBulk ? (
              <p>
                {productCount} labels will be generated with {codeType === "barcode" ? "barcodes" : "QR codes"}.
              </p>
            ) : (
              <p>
                Printing label for <span className="font-medium text-foreground">{products[0]?.name}</span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
