import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface TrialBannerProps {
  daysRemaining: number;
  planName: string;
}

export function TrialBanner({ daysRemaining, planName }: TrialBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <div className={`relative px-4 py-3 flex items-center justify-between gap-4 ${
      isUrgent 
        ? 'bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border-b border-destructive/20' 
        : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-full ${isUrgent ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Clock className={`h-4 w-4 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {daysRemaining > 0 ? (
              <>
                <span className={isUrgent ? 'text-destructive' : 'text-primary'}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </span>{' '}
                left in your free trial
              </>
            ) : (
              <span className="text-destructive">Your trial has expired</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            You're on the {planName} plan
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant={isUrgent ? "destructive" : "default"}
          onClick={() => navigate("/landing#pricing")}
        >
          <Badge variant="secondary" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-xs">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Soon
          </Badge>
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          Upgrade
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
