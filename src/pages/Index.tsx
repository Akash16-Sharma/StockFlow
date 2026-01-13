import { useCallback, useState } from "react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { SwipeableProductCard } from "@/components/SwipeableProductCard";
import { StatCardSkeleton, ProductCardSkeleton } from "@/components/SkeletonCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { DashboardCharts } from "@/components/DashboardCharts";
import { GatedCSVImportExport } from "@/components/GatedCSVImportExport";
import { useProducts } from "@/hooks/useProducts";
import { getStockStatus, getExpiryStatus } from "@/lib/inventory";
import { Package, AlertTriangle, Clock, XCircle, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Index() {
  const { products, isLoading, refetch, deleteProduct } = useProducts();

  const [chartsOpen, setChartsOpen] = useState(false);

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter(p => {
      const status = getStockStatus(p.quantity, p.minStock);
      return status === 'low' || status === 'critical';
    }).length,
    expiring: products.filter(p => getExpiryStatus(p.expiryDate) === 'expiring-soon').length,
    outOfStock: products.filter(p => p.quantity === 0).length,
  };
  
  // Get items needing attention
  const alertItems = products.filter(p => {
    const stockStatus = getStockStatus(p.quantity, p.minStock);
    const expiryStatus = getExpiryStatus(p.expiryDate);
    return stockStatus !== 'healthy' || expiryStatus === 'expiring-soon' || expiryStatus === 'expired';
  }).slice(0, 5);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Dashboard refreshed");
  }, [refetch]);

  const handleEdit = (productId: string) => {
    toast.info(`Edit product ${productId}`, {
      description: "Edit functionality coming soon",
    });
  };

  const handleDelete = (productId: string) => {
    deleteProduct.mutate(productId);
  };
  
  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Overview of your inventory</p>
            </div>
            <div className="flex items-center gap-2">
              <GatedCSVImportExport products={products} />
              <Button asChild size="sm" className="hidden md:flex">
                <Link to="/add">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="animate-fade-in stagger-1">
                <StatCard 
                  title="Total Products" 
                  value={stats.total} 
                  icon={Package}
                />
              </div>
              <div className="animate-fade-in stagger-2">
                <StatCard 
                  title="Low Stock" 
                  value={stats.lowStock} 
                  icon={AlertTriangle}
                  variant={stats.lowStock > 0 ? 'warning' : 'default'}
                />
              </div>
              <div className="animate-fade-in stagger-3">
                <StatCard 
                  title="Expiring Soon" 
                  value={stats.expiring} 
                  icon={Clock}
                  variant={stats.expiring > 0 ? 'warning' : 'default'}
                />
              </div>
              <div className="animate-fade-in stagger-4">
                <StatCard 
                  title="Out of Stock" 
                  value={stats.outOfStock} 
                  icon={XCircle}
                  variant={stats.outOfStock > 0 ? 'danger' : 'default'}
                />
              </div>
            </div>
          )}

          {/* Charts Section */}
          {!isLoading && products.length > 0 && (
            <Collapsible open={chartsOpen} onOpenChange={setChartsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </span>
                  {chartsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <DashboardCharts products={products} />
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Alerts Section */}
          <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Needs Attention</h2>
              <Link 
                to="/products" 
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : alertItems.length > 0 ? (
              <div className="space-y-2">
                {alertItems.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${250 + index * 50}ms` }}
                  >
                    <SwipeableProductCard 
                      product={product}
                      onEdit={() => handleEdit(product.id)}
                      onDelete={() => handleDelete(product.id)}
                    />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="text-center py-8 text-muted-foreground animate-fade-in">
                <p>All items are in good stock</p>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to start tracking inventory"
                actionLabel="Add Product"
                actionHref="/add"
              />
            )}
          </section>
        </div>
      </PullToRefresh>
    </Layout>
  );
}
