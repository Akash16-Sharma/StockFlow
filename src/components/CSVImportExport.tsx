import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { parseCSV, exportToCSV, downloadCSV, getCSVTemplate } from "@/lib/csv";
import { Product } from "@/types/inventory";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVImportExportProps {
  products: Product[];
}

export function CSVImportExport({ products }: CSVImportExportProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Partial<Product>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct } = useProducts();

  const handleExport = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    const csv = exportToCSV(products);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `inventory-export-${date}.csv`);
    toast.success(`Exported ${products.length} products`);
  };

  const handleDownloadTemplate = () => {
    downloadCSV(getCSVTemplate(), "inventory-template.csv");
    toast.success("Template downloaded");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        setParsedProducts(parsed);
        setImportErrors([]);
        
        if (parsed.length === 0) {
          setImportErrors(["No valid products found. Check that your CSV has headers: Name, SKU, Quantity, etc."]);
        }
      } catch (error) {
        setImportErrors(["Failed to parse CSV file"]);
        setParsedProducts([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) return;

    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    for (const product of parsedProducts) {
      try {
        await addProduct.mutateAsync({
          name: product.name || "",
          sku: product.sku || "",
          barcode: product.barcode || null,
          quantity: product.quantity || 0,
          minStock: product.minStock || 0,
          expiryDate: product.expiryDate || null,
          category: product.category || "General",
        });
        successCount++;
      } catch (error) {
        errors.push(`${product.name || product.sku}: ${error instanceof Error ? error.message : "Failed to import"}`);
      }
    }

    setImporting(false);
    
    if (successCount > 0) {
      toast.success(`Imported ${successCount} products`);
    }
    
    if (errors.length > 0) {
      setImportErrors(errors);
    } else {
      setIsImportOpen(false);
      setParsedProducts([]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: Name, SKU, Barcode, Quantity, MinStock, ExpiryDate, Category
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Download */}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={handleDownloadTemplate}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Download template
            </Button>

            {/* File Input */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to select CSV file
                </span>
              </label>
            </div>

            {/* Errors */}
            {importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ScrollArea className="max-h-24">
                    {importErrors.map((err, i) => (
                      <div key={i} className="text-xs">{err}</div>
                    ))}
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {parsedProducts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Found {parsedProducts.length} products to import
                </div>
                <ScrollArea className="h-32 border rounded-lg p-2">
                  <div className="space-y-1 text-xs">
                    {parsedProducts.slice(0, 10).map((p, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">({p.sku})</span>
                        <span>Qty: {p.quantity}</span>
                      </div>
                    ))}
                    {parsedProducts.length > 10 && (
                      <div className="text-muted-foreground">
                        ...and {parsedProducts.length - 10} more
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={parsedProducts.length === 0 || importing}
              className="w-full"
            >
              {importing ? "Importing..." : `Import ${parsedProducts.length} Products`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
