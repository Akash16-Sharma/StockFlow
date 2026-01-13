import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";

interface UPIPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  amount?: number;
}

// UPI ID with number masked for display
const UPI_ID = "8810352438@ptaxis";
const MASKED_UPI_ID = "****@ptaxis";
const PAYEE_NAME = "Aakash Sharma";

export function UPIPaymentDialog({ 
  open, 
  onOpenChange, 
  planName = "Professional",
  amount = 1599
}: UPIPaymentDialogProps) {
  // Generate UPI deep link with amount
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`StockFlow ${planName} Plan`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay for {planName} Plan</DialogTitle>
          <DialogDescription>
            Scan the QR code with any UPI app to pay ₹{amount.toLocaleString('en-IN')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Development Warning */}
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>⚠️ Development Phase:</strong> Payment system is under development. 
              Please use the <strong>Free Trial</strong> for now. Do not make any payments yet!
            </AlertDescription>
          </Alert>
          
          {/* Dynamic QR Code with amount */}
          <div className="bg-white p-4 rounded-xl border-2 border-primary/20 opacity-50">
            <QRCode 
              value={upiLink}
              size={200}
              level="H"
              className="w-full h-auto"
            />
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              UPI: {MASKED_UPI_ID}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-[#00BAF2]">Paytm</span>
            <span>•</span>
            <span className="font-semibold text-[#5f259f]">PhonePe</span>
            <span>•</span>
            <span className="font-semibold text-[#4285F4]">GPay</span>
            <span>•</span>
            <span className="font-semibold text-[#00796B]">BHIM</span>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            After payment, share your transaction ID to activate your plan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
