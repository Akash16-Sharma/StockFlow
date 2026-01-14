import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PlanBadge } from "@/components/PlanBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { useProducts } from "@/hooks/useProducts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { PLAN_DISPLAY_NAMES, PLAN_LIMITS, PLAN_PRICES } from "@/lib/plans";
import { format } from "date-fns";
import { 
  Crown, 
  Package, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SubscriptionSettings() {
  const navigate = useNavigate();
  const { 
    subscription, 
    plan, 
    limits, 
    isTrialing, 
    trialDaysRemaining, 
    isTrialExpired,
    isLoading: subscriptionLoading 
  } = useSubscription();
  const { products, isLoading: productsLoading } = useProducts();
  const { users, isAdminLoading } = useUserRoles();

  if (subscriptionLoading || productsLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const productCount = products.length;
  const productLimit = limits.maxProducts;
  const productUsagePercent = productLimit === Infinity ? 0 : (productCount / productLimit) * 100;

  const teamCount = users.length;
  const teamLimit = limits.maxTeamMembers;
  const teamUsagePercent = teamLimit === Infinity ? 0 : (teamCount / teamLimit) * 100;

  const features = [
    { name: "Barcode Scanning", enabled: limits.features.barcodeScanning },
    { name: "Basic Analytics", enabled: limits.features.basicAnalytics },
    { name: "Advanced Analytics", enabled: limits.features.advancedAnalytics },
    { name: "Stock Alerts", enabled: limits.features.stockAlerts },
    { name: "CSV Import/Export", enabled: limits.features.csvImportExport },
    { name: "API Access", enabled: limits.features.apiAccess },
    { name: "Priority Support", enabled: limits.features.prioritySupport },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
            </div>
            <PlanBadge plan={plan} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trial Status */}
          {isTrialing && (
            <div className={`p-3 rounded-lg border ${
              isTrialExpired 
                ? 'bg-destructive/10 border-destructive/20' 
                : trialDaysRemaining <= 3 
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-primary/10 border-primary/20'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${
                  isTrialExpired ? 'text-destructive' : trialDaysRemaining <= 3 ? 'text-amber-500' : 'text-primary'
                }`} />
                <span className="text-sm font-medium">
                  {isTrialExpired 
                    ? 'Your trial has expired' 
                    : `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left in trial`
                  }
                </span>
              </div>
              {subscription?.trialEndsAt && (
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {isTrialExpired ? 'Expired on' : 'Expires'} {format(subscription.trialEndsAt, 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Plan Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{PLAN_PRICES[plan].display}</span>
            {plan !== 'starter' && plan !== 'enterprise' && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>

          <Separator />

          {/* Usage Stats */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Usage</h4>
            
            {/* Products */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Products</span>
                </div>
                <span className={productUsagePercent >= 90 ? 'text-destructive font-medium' : ''}>
                  {productCount} / {productLimit === Infinity ? '∞' : productLimit}
                </span>
              </div>
              {productLimit !== Infinity && (
                <Progress 
                  value={productUsagePercent} 
                  className={`h-2 ${productUsagePercent >= 90 ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Team Members</span>
                </div>
                <span className={teamUsagePercent >= 90 ? 'text-destructive font-medium' : ''}>
                  {teamCount} / {teamLimit === Infinity ? '∞' : teamLimit}
                </span>
              </div>
              {teamLimit !== Infinity && (
                <Progress 
                  value={teamUsagePercent} 
                  className={`h-2 ${teamUsagePercent >= 90 ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Plan Features
          </CardTitle>
          <CardDescription>
            What's included in your {PLAN_DISPLAY_NAMES[plan]} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  feature.enabled ? 'bg-primary/5' : 'bg-muted/50'
                }`}
              >
                {feature.enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm ${!feature.enabled && 'text-muted-foreground'}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {plan === 'starter' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Upgrade to Professional
                </h4>
                <p className="text-sm text-muted-foreground">
                  Unlock unlimited products, team members, and advanced features
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
                <Button onClick={() => navigate('/landing#pricing')}>
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
