import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanType, PLAN_DISPLAY_NAMES, PLAN_LIMITS } from "@/lib/plans";

interface UpgradePromptProps {
  feature: string;
  currentPlan: PlanType;
  requiredPlan?: PlanType;
  currentUsage?: number;
  limit?: number;
  variant?: "inline" | "card" | "banner";
}

export function UpgradePrompt({ 
  feature, 
  currentPlan, 
  requiredPlan = "professional",
  currentUsage,
  limit,
  variant = "card" 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Crown className="h-4 w-4 text-amber-500" />
        <span>
          {feature} requires{" "}
          <button 
            onClick={() => navigate("/landing#pricing")}
            className="text-primary hover:underline font-medium"
          >
            {PLAN_DISPLAY_NAMES[requiredPlan]}
          </button>
        </span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-full">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{feature}</p>
            {currentUsage !== undefined && limit !== undefined && (
              <p className="text-xs text-muted-foreground">
                {currentUsage}/{limit === Infinity ? '∞' : limit} used
              </p>
            )}
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate("/landing#pricing")}
          className="border-amber-500/50 hover:bg-amber-500/10"
        >
          <Badge variant="secondary" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Upgrade to Unlock</CardTitle>
        </div>
        <CardDescription>{feature}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Plan</span>
          <Badge variant="outline">{PLAN_DISPLAY_NAMES[currentPlan]}</Badge>
        </div>
        
        {currentUsage !== undefined && limit !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage</span>
              <span className={currentUsage >= limit ? "text-destructive font-medium" : ""}>
                {currentUsage} / {limit === Infinity ? '∞' : limit}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${currentUsage >= limit ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, (currentUsage / limit) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            className="w-full" 
            onClick={() => navigate("/landing#pricing")}
          >
            <Badge variant="secondary" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {PLAN_DISPLAY_NAMES[requiredPlan]} unlocks {PLAN_LIMITS[requiredPlan].maxProducts === Infinity ? 'unlimited' : PLAN_LIMITS[requiredPlan].maxProducts} products
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
