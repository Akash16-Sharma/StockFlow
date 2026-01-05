import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Index from "./pages/Index";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import QuickScan from "./pages/QuickScan";
import StockTake from "./pages/StockTake";
import AdminUsers from "./pages/AdminUsers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize realtime notifications
function RealtimeNotifications() {
  useRealtimeNotifications();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RealtimeNotifications />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><QuickScan /></ProtectedRoute>} />
              <Route path="/stock-take" element={<ProtectedRoute><StockTake /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
