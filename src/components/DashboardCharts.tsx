import { useMemo } from "react";
import { Product } from "@/types/inventory";
import { getStockStatus, getExpiryStatus } from "@/lib/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface DashboardChartsProps {
  products: Product[];
}

const COLORS = {
  healthy: "hsl(var(--primary))",
  low: "hsl(45, 93%, 47%)",
  critical: "hsl(25, 95%, 53%)",
  out: "hsl(0, 84%, 60%)",
};

const EXPIRY_COLORS = {
  fresh: "hsl(var(--primary))",
  "expiring-soon": "hsl(45, 93%, 47%)",
  expired: "hsl(0, 84%, 60%)",
  none: "hsl(var(--muted))",
};

export function DashboardCharts({ products }: DashboardChartsProps) {
  const stockData = useMemo(() => {
    const counts = { healthy: 0, low: 0, critical: 0, out: 0 };
    products.forEach((p) => {
      const status = getStockStatus(p.quantity, p.minStock);
      counts[status]++;
    });
    return [
      { name: "Healthy", value: counts.healthy, color: COLORS.healthy },
      { name: "Low", value: counts.low, color: COLORS.low },
      { name: "Critical", value: counts.critical, color: COLORS.critical },
      { name: "Out", value: counts.out, color: COLORS.out },
    ].filter((d) => d.value > 0);
  }, [products]);

  const expiryData = useMemo(() => {
    const counts = { fresh: 0, "expiring-soon": 0, expired: 0, none: 0 };
    products.forEach((p) => {
      const status = getExpiryStatus(p.expiryDate);
      counts[status]++;
    });
    return [
      { name: "Fresh", value: counts.fresh, color: EXPIRY_COLORS.fresh },
      { name: "Expiring Soon", value: counts["expiring-soon"], color: EXPIRY_COLORS["expiring-soon"] },
      { name: "Expired", value: counts.expired, color: EXPIRY_COLORS.expired },
      { name: "No Expiry", value: counts.none, color: EXPIRY_COLORS.none },
    ].filter((d) => d.value > 0);
  }, [products]);

  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; quantity: number }> = {};
    products.forEach((p) => {
      if (!counts[p.category]) {
        counts[p.category] = { count: 0, quantity: 0 };
      }
      counts[p.category].count++;
      counts[p.category].quantity += p.quantity;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        products: data.count,
        stock: data.quantity,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
        quantity: p.quantity,
      }));
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stock Status Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
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
                    borderRadius: "8px"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Status Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Expiry Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
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
                    borderRadius: "8px"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stock by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
