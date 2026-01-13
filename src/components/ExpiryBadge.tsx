import { Badge } from "@/components/ui/badge";
import { ExpiryStatus } from "@/types/inventory";
import { getDaysUntilExpiry } from "@/lib/inventory";
import { Clock, AlertTriangle, XCircle } from "lucide-react";

interface ExpiryBadgeProps {
  expiryDate: string | null;
  status: ExpiryStatus;
}

export function ExpiryBadge({ expiryDate, status }: ExpiryBadgeProps) {
  if (status === 'none') return null;
  
  const days = getDaysUntilExpiry(expiryDate);
  
  if (status === 'expired') {
    return (
      <Badge variant="danger" className="gap-1">
        <XCircle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }
  
  if (status === 'expiring-soon') {
    return (
      <Badge variant="warning" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d left`}
      </Badge>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {days}d
    </span>
  );
}
