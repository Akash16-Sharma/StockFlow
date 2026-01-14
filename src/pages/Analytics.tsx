import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useProducts } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useSubscription";
import { getStockStatus, getExpiryStatus } from "@/lib/inventory";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, Area, AreaChart,
  CartesianGrid
} from "recharts";
import { 
  TrendingUp, TrendingDown, Package, AlertTriangle, Clock, 
  BarChart3, PieChartIcon, Activity, Layers, ArrowUpRight,
  ArrowDownRight, Minus, Loader2
} from "lucide-react";
import { differenceInDays, format, subDays } from "date-fns";

const COLORS = {
  primary: "hsl(var(--primary))",
  healthy: "hsl(142, 76%, 36%)",
  warning: "hsl(45, 93%, 47%)",
  danger: "hsl(0, 84%, 60%)",
  muted: "hsl(var(--muted))",
  accent: "hsl(262, 83%, 58%)",
};

export default function Analytics() {
  const { products, isLoading: productsLoading } = useProducts();
  const { plan, hasFeature, isLoading: subscriptionLoading } = useSubscription();
  
  const canAccessAdvancedAnalytics = hasFeature('advancedAnalytics');
  
  // Stock status distribution
  const stockData = useMemo(() => {
    const counts = { healthy: 0, low: 0, critical: 0, out: 0 };
    products.forEach((p) => {
      const status = getStockStatus(p.quantity, p.minStock);
      counts[status]++;
    });
    return [
      { name: "Healthy", value: counts.healthy, color: COLORS.healthy, fill: COLORS.healthy },
      { name: "Low", value: counts.low, color: COLORS.warning, fill: COLORS.warning },
      { name: "Critical", value: counts.critical, color: "hsl(25, 95%, 53%)", fill: "hsl(25, 95%, 53%)" },
      { name: "Out of Stock", value: counts.out, color: COLORS.danger, fill: COLORS.danger },
    ].filter((d) => d.value > 0);
  }, [products]);

  // Expiry distribution
  const expiryData = useMemo(() => {
    const counts = { fresh: 0, "expiring-soon": 0, expired: 0, none: 0 };
    products.forEach((p) => {
      const status = getExpiryStatus(p.expiryDate);
      counts[status]++;
    });
    return [
      { name: "Fresh", value: counts.fresh, color: COLORS.healthy, fill: COLORS.healthy },
      { name: "Expiring Soon", value: counts["expiring-soon"], color: COLORS.warning, fill: COLORS.warning },
      { name: "Expired", value: counts.expired, color: COLORS.danger, fill: COLORS.danger },
      { name: "No Expiry", value: counts.none, color: COLORS.muted, fill: COLORS.muted },
    ].filter((d) => d.value > 0);
  }, [products]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; quantity: number; value: number }> = {};
    products.forEach((p) => {
      if (!counts[p.category]) {
        counts[p.category] = { count: 0, quantity: 0, value: 0 };
      }
      counts[p.category].count++;
      counts[p.category].quantity += p.quantity;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({
        name: name.length > 10 ? name.slice(0, 10) + "..." : name,
        fullName: name,
        products: data.count,
        stock: data.quantity,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);
  }, [products]);

  // Top and bottom products
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
        fullName: p.name,
        quantity: p.quantity,
        category: p.category,
      }));
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => {
        const status = getStockStatus(p.quantity, p.minStock);
        return status === 'low' || status === 'critical' || status === 'out';
      })
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
        fullName: p.name,
        quantity: p.quantity,
        minStock: p.minStock,
        deficit: p.minStock - p.quantity,
      }));
  }, [products]);

  // Simulate trend data (in real app, this would come from historical data)
  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const baseValue = products.length;
      const variance = Math.floor(Math.random() * 5) - 2;
      return {
        date: format(date, 'EEE'),
        fullDate: format(date, 'MMM dd'),
        products: Math.max(0, baseValue + variance),
        lowStock: Math.floor(Math.random() * 10),
      };
    });
  }, [products.length]);

  // Summary stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = products.filter(p => {
      const status = getStockStatus(p.quantity, p.minStock);
      return status === 'low' || status === 'critical';
    }).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const expiringCount = products.filter(p => getExpiryStatus(p.expiryDate) === 'expiring-soon').length;
    const categories = new Set(products.map(p => p.category)).size;
    
    return {
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      categories,
      avgStock: totalProducts > 0 ? Math.round(totalStock / totalProducts) : 0,
      healthRate: totalProducts > 0 ? Math.round(((totalProducts - lowStockCount - outOfStockCount) / totalProducts) * 100) : 100,
    };
  }, [products]);

  if (productsLoading || subscriptionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show upgrade prompt for starter users
  if (!canAccessAdvancedAnalytics) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground">Deep insights into your inventory performance</p>
          </div>
          
          <UpgradePrompt
            feature="Advanced Analytics unlocks detailed inventory insights, trend analysis, and performance metrics"
            currentPlan={plan}
            requiredPlan="professional"
          />
          
          {/* Preview of what they'll get */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-50 pointer-events-none blur-sm">
            <Card><CardContent className="p-4 h-24" /></Card>
            <Card><CardContent className="p-4 h-24" /></Card>
            <Card><CardContent className="p-4 h-24" /></Card>
            <Card><CardContent className="p-4 h-24" /></Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Advanced Analytics</h1>
            <p className="text-sm text-muted-foreground">Deep insights into your inventory</p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>

        {/* Quick Stats - Mobile horizontal scroll */}
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2 min-w-max md:grid md:grid-cols-4 md:min-w-0">
            <Card className="min-w-[140px] md:min-w-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {stats.healthRate}% healthy
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-[140px] md:min-w-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>stable</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalStock.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-[140px] md:min-w-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {stats.lowStockCount > 0 && (
                    <div className="flex items-center text-xs text-amber-600">
                      <ArrowDownRight className="h-3 w-3" />
                      <span>needs attention</span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl md:text-3xl font-bold">{stats.lowStockCount}</p>
                  <p className="text-xs text-muted-foreground">Low Stock Items</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-[140px] md:min-w-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {stats.expiringCount > 0 && (
                    <Badge variant="destructive" className="text-xs">urgent</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl md:text-3xl font-bold">{stats.expiringCount}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <ScrollBar orientation="horizontal" className="md:hidden" />
        </ScrollArea>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm py-2">
              <BarChart3 className="h-3.5 w-3.5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs md:text-sm py-2">
              <PieChartIcon className="h-3.5 w-3.5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Stock</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs md:text-sm py-2">
              <Activity className="h-3.5 w-3.5 mr-1 md:mr-2" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock Status */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
                  <CardDescription className="text-xs">Distribution by stock level</CardDescription>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="h-[200px] md:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} products`, ""]}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: "12px" }}
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium">By Category</CardTitle>
                  <CardDescription className="text-xs">Stock distribution across categories</CardDescription>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="h-[200px] md:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={70} 
                          tick={{ fontSize: 11 }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}
                          formatter={(value: number, name: string) => [value, name === 'stock' ? 'Units' : 'Products']}
                        />
                        <Bar dataKey="stock" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top & Low Stock Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Highest Stock
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="space-y-2">
                    {topProducts.map((product, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{product.fullName}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {product.quantity} units
                        </Badge>
                      </div>
                    ))}
                    {topProducts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No products yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Needs Restock
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="space-y-2">
                    {lowStockProducts.map((product, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{product.fullName}</p>
                            <p className="text-xs text-red-500">Need +{product.deficit} units</p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {product.quantity} left
                        </Badge>
                      </div>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <p className="text-sm text-green-600 text-center py-4">All products well stocked! 🎉</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiry Status */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium">Expiry Overview</CardTitle>
                  <CardDescription className="text-xs">Products by expiry status</CardDescription>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="h-[200px] md:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expiryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expiryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} products`, ""]}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: "12px" }}
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                  <CardTitle className="text-sm font-medium">Inventory Summary</CardTitle>
                  <CardDescription className="text-xs">Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Categories</span>
                      <span className="font-semibold">{stats.categories}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Avg. Stock per Product</span>
                      <span className="font-semibold">{stats.avgStock}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Out of Stock</span>
                      <Badge variant={stats.outOfStockCount > 0 ? "destructive" : "secondary"}>
                        {stats.outOfStockCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Health Rate</span>
                      <Badge variant={stats.healthRate >= 80 ? "default" : "secondary"} className={stats.healthRate >= 80 ? "bg-green-600" : ""}>
                        {stats.healthRate}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                <CardTitle className="text-sm font-medium">7-Day Overview</CardTitle>
                <CardDescription className="text-xs">Product count trends over the past week</CardDescription>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-4">
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                        labelFormatter={(label) => trendData.find(d => d.date === label)?.fullDate || label}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="products" 
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorProducts)" 
                        name="Products"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 px-3 md:px-6 pt-4">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <CardDescription className="text-xs">Items requiring attention over time</CardDescription>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-4">
                <div className="h-[200px] md:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lowStock" 
                        stroke={COLORS.warning}
                        strokeWidth={2}
                        dot={{ fill: COLORS.warning, strokeWidth: 0, r: 4 }}
                        name="Low Stock Items"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
