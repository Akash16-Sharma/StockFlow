import { lazy, Suspense, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Lazy load pages for better initial bundle size
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const QuickScan = lazy(() => import("./pages/QuickScan"));
const StockTake = lazy(() => import("./pages/StockTake"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
));
PageLoader.displayName = "PageLoader";

// Component to initialize realtime notifications
const RealtimeNotifications = memo(() => {
  useRealtimeNotifications();
  return null;
});
RealtimeNotifications.displayName = "RealtimeNotifications";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OnboardingCheck>
              <RealtimeNotifications />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/confirm-email" element={<ConfirmEmail />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                  <Route path="/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                  <Route path="/scan" element={<ProtectedRoute><QuickScan /></ProtectedRoute>} />
                  <Route path="/stock-take" element={<ProtectedRoute><StockTake /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </OnboardingCheck>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
