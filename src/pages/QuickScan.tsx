import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { QuickActionPanel } from "@/components/QuickActionPanel";
import { ScanHistoryList } from "@/components/ScanHistoryList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/inventory";
import { 
  ScanBarcode, 
  Plus, 
  Minus, 
  Search, 
  History,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";

export type ScanMode = "lookup" | "stock-in" | "stock-out" | "add";

export interface ScanHistoryItem {
  id: string;
  barcode: string;
  action: ScanMode;
  product: Product | null;
  quantityChange?: number;
  timestamp: Date;
  undone?: boolean;
}

export default function QuickScan() {
  const navigate = useNavigate();
  const { products, updateProduct, addProduct } = useProducts();
  const [scanMode, setScanMode] = useState<ScanMode>("stock-in");
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Play beep sound on successful scan
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Vibrate on action (mobile)
  const vibrate = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const addToHistory = useCallback((
    barcode: string,
    action: ScanMode,
    product: Product | null,
    quantityChange?: number
  ) => {
    const historyItem: ScanHistoryItem = {
      id: crypto.randomUUID(),
      barcode,
      action,
      product,
      quantityChange,
      timestamp: new Date(),
    };
    setScanHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const handleScan = useCallback((code: string) => {
    // Look up product by barcode or SKU
    const product = products.find(p => p.barcode === code || p.sku === code);
    
    // For stock-in, stock-out, and lookup modes - only accept products in inventory
    if (scanMode === "stock-in" || scanMode === "stock-out" || scanMode === "lookup") {
      if (!product) {
        toast.error("Product not in inventory", {
          description: `Barcode "${code}" not found in your inventory.`,
          action: {
            label: "Add New",
            onClick: () => {
              setScanMode("add");
              setLastScannedBarcode(code);
            },
          },
        });
        return;
      }
      
      playBeep();
      vibrate();
      
      setLastScannedBarcode(code);
      setLastScannedProduct(product);
      
      if (scanMode === "lookup") {
        toast.success(`Found: ${product.name}`, {
          description: `Stock: ${product.quantity} | SKU: ${product.sku}`,
        });
      } else {
        toast.success(`Found: ${product.name}`, {
          description: `Stock: ${product.quantity} — Enter quantity below`,
        });
      }
    } else if (scanMode === "add") {
      // Add mode - accept any barcode
      playBeep();
      vibrate();
      
      setLastScannedBarcode(code);
      
      if (product) {
        // Product already exists
        toast.warning("Product already exists", {
          description: `"${product.name}" is already in your inventory.`,
          action: {
            label: "View",
            onClick: () => {
              setScanMode("lookup");
              setLastScannedProduct(product);
            },
          },
        });
        setLastScannedProduct(product);
      } else {
        setLastScannedProduct(null);
        toast.info("New barcode scanned", {
          description: "Fill in the product details below",
        });
      }
    }
  }, [products, scanMode, playBeep, vibrate]);

  const handleStockIn = useCallback(async (product: Product, amount: number) => {
    const newQuantity = product.quantity + amount;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        quantity: newQuantity,
        silent: true,
      });
      
      addToHistory(product.barcode || product.sku, "stock-in", product, amount);
      
      toast.success("Stock added", {
        description: `+${amount} ${product.name} — New total: ${newQuantity}`,
      });
      
      setLastScannedProduct(prev => prev ? { ...prev, quantity: newQuantity } : null);
    } catch {
      // Error handled by mutation
    }
  }, [updateProduct, addToHistory]);

  const handleStockOut = useCallback(async (product: Product, amount: number) => {
    if (product.quantity < amount) {
      toast.error("Not enough stock", {
        description: `Only ${product.quantity} units available.`,
      });
      return;
    }
    
    const newQuantity = product.quantity - amount;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        quantity: newQuantity,
        silent: true,
      });
      
      addToHistory(product.barcode || product.sku, "stock-out", product, amount);
      
      toast.success("Stock removed", {
        description: `-${amount} ${product.name} — New total: ${newQuantity}`,
      });
      
      setLastScannedProduct(prev => prev ? { ...prev, quantity: newQuantity } : null);
    } catch {
      // Error handled by mutation
    }
  }, [updateProduct, addToHistory]);

  const handleQuickAdd = useCallback(async (name: string, category: string, quantity: number) => {
    if (!lastScannedBarcode || !name.trim()) return;
    
    const sku = `SKU-${Date.now().toString(36).toUpperCase()}`;
    
    try {
      const newProduct = await addProduct.mutateAsync({
        name: name.trim(),
        sku,
        barcode: lastScannedBarcode,
        quantity,
        minStock: 10,
        expiryDate: null,
        category: category || "General",
      });
      
      addToHistory(lastScannedBarcode, "add", newProduct, quantity);
      
      setLastScannedProduct(newProduct);
      setLastScannedBarcode(null);
      setScanMode("stock-in");
    } catch {
      // Error handled by mutation
    }
  }, [lastScannedBarcode, addProduct, addToHistory]);

  const handleUndo = useCallback(async (historyItem: ScanHistoryItem) => {
    if (!historyItem.product || historyItem.undone) return;
    
    const product = products.find(p => p.id === historyItem.product?.id);
    if (!product) {
      toast.error("Cannot undo", {
        description: "This product no longer exists.",
      });
      return;
    }
    
    let newQuantity = product.quantity;
    
    if (historyItem.action === "stock-in" && historyItem.quantityChange) {
      newQuantity = product.quantity - historyItem.quantityChange;
    } else if (historyItem.action === "stock-out" && historyItem.quantityChange) {
      newQuantity = product.quantity + historyItem.quantityChange;
    } else {
      toast.error("Cannot undo", {
        description: "This type of action cannot be reversed.",
      });
      return;
    }
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        quantity: Math.max(0, newQuantity),
        silent: true,
      });
      
      setScanHistory(prev => 
        prev.map(item => 
          item.id === historyItem.id ? { ...item, undone: true } : item
        )
      );
      
      toast.success("Undone", {
        description: `${product.name} stock restored to ${Math.max(0, newQuantity)}.`,
      });
    } catch {
      // Error handled by mutation
    }
  }, [products, updateProduct]);

  return (
    <Layout>
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Quick Scan</h1>
            <p className="text-muted-foreground text-sm">
              Scan → Enter quantity → Confirm
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant={showHistory ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              title="Scan history"
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mode Selector */}
        <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as ScanMode)} className="animate-fade-in">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="stock-in" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Stock In</span>
            </TabsTrigger>
            <TabsTrigger value="stock-out" className="flex items-center gap-1">
              <Minus className="h-4 w-4" />
              <span className="hidden sm:inline">Stock Out</span>
            </TabsTrigger>
            <TabsTrigger value="lookup" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Lookup</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1">
              <ScanBarcode className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Mode Description */}
        <Card className="animate-fade-in border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <p className="text-sm text-center">
              {scanMode === "stock-in" && "📦 Scan existing product → Add stock"}
              {scanMode === "stock-out" && "📤 Scan existing product → Remove stock"}
              {scanMode === "lookup" && "🔍 Scan to view product details"}
              {scanMode === "add" && "➕ Scan any barcode → Create new product"}
            </p>
          </CardContent>
        </Card>

        {/* Scanner */}
        {!showHistory && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => navigate("/products")}
            className="h-[250px] animate-fade-in"
          />
        )}

        {/* History Panel */}
        {showHistory && (
          <ScanHistoryList 
            history={scanHistory}
            onUndo={handleUndo}
          />
        )}

        {/* Quick Action Panel */}
        {!showHistory && (
          <QuickActionPanel
            product={lastScannedProduct}
            barcode={lastScannedBarcode}
            scanMode={scanMode}
            onStockIn={(amount) => lastScannedProduct && handleStockIn(lastScannedProduct, amount)}
            onStockOut={(amount) => lastScannedProduct && handleStockOut(lastScannedProduct, amount)}
            onQuickAdd={handleQuickAdd}
          />
        )}
      </div>
    </Layout>
  );
}
