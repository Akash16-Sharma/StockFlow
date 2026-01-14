import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SwipeableProductCard } from "@/components/SwipeableProductCard";
import { ProductCardSkeleton } from "@/components/SkeletonCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { PrintDialog } from "@/components/PrintDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/types/inventory";
import { Search, Package, ScanBarcode, Printer, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { products, isLoading, refetch, deleteProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPrint, setShowPrint] = useState(false);
  
  const isSelectMode = selectedIds.size > 0;
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (product.barcode && product.barcode.includes(debouncedSearch))
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Inventory refreshed");
  }, [refetch]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowEdit(true);
  };

  const handleDelete = (productId: string) => {
    deleteProduct.mutate(productId);
  };

  const toggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  
  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 animate-fade-in">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
              <p className="text-muted-foreground text-sm">
                Manage your inventory items
                <span className="text-xs ml-2 hidden md:inline text-muted-foreground/60">
                  (Swipe left on mobile to edit/delete)
                </span>
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/scan")}
              >
                <ScanBarcode className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Quick Scan</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate("/add")}
              >
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {isSelectMode && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
              <span className="text-sm font-medium flex-1">
                {selectedIds.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                size="sm"
                onClick={() => setShowPrint(true)}
              >
                <Printer className="h-4 w-4 mr-1" />
                Print Labels
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Search */}
          <div className="relative animate-fade-in" style={{ animationDelay: '50ms' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search products"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Product List */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-2">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in flex items-center gap-2"
                  style={{ animationDelay: `${(index + 2) * 30}ms` }}
                >
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleSelect(product.id)}
                    className="shrink-0"
                    aria-label={`Select ${product.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <SwipeableProductCard 
                      product={product}
                      onClick={() => handleProductClick(product)}
                      onEdit={() => handleEdit(product)}
                      onDelete={() => handleDelete(product.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : search ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No products matching "${search}"`}
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first product to start tracking inventory"
              actionLabel="Add Product"
              actionHref="/add"
            />
          )}
        </div>
      </PullToRefresh>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        open={showDetail}
        onOpenChange={setShowDetail}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editProduct}
        open={showEdit}
        onOpenChange={setShowEdit}
      />

      {/* Print Dialog for bulk */}
      <PrintDialog
        products={selectedProducts}
        open={showPrint}
        onOpenChange={(open) => {
          setShowPrint(open);
          if (!open) clearSelection();
        }}
      />
    </Layout>
  );
}
