import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, SwitchCamera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  onScan: (code: string, format: string) => void;
  onClose: () => void;
  className?: string;
}

export const BarcodeScanner = forwardRef<HTMLDivElement, BarcodeScannerProps>(
  ({ onScan, onClose, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

    const startScanner = useCallback(async (deviceId?: string) => {
      if (!videoRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Stop existing reader
        if (readerRef.current) {
          readerRef.current.reset();
        }

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Get available cameras
        const videoInputDevices = await reader.listVideoInputDevices();
        setDevices(videoInputDevices);

        if (videoInputDevices.length === 0) {
          throw new Error("No camera found");
        }

        const selectedDeviceId = deviceId || videoInputDevices[0].deviceId;

        // Prefer back camera on mobile
        const backCamera = videoInputDevices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear")
        );
        const deviceToUse = deviceId || backCamera?.deviceId || selectedDeviceId;

        await reader.decodeFromVideoDevice(
          deviceToUse,
          videoRef.current,
          (result, err) => {
            if (result) {
              const format = result.getBarcodeFormat().toString();
              onScan(result.getText(), format);
            }
            if (err && !(err instanceof NotFoundException)) {
              // Only log non-common errors
            }
          }
        );

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to access camera");
        setIsLoading(false);
      }
    }, [onScan]);

    const switchCamera = useCallback(() => {
      if (devices.length <= 1) return;
      const nextIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextIndex);
      startScanner(devices[nextIndex].deviceId);
    }, [devices, currentDeviceIndex, startScanner]);

    useEffect(() => {
      startScanner();

      return () => {
        if (readerRef.current) {
          readerRef.current.reset();
        }
      };
    }, [startScanner]);

    return (
      <Card ref={ref} className={cn("relative overflow-hidden bg-black", className)}>
        {/* Video Preview */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover min-h-[300px]"
          playsInline
          muted
        />

        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scan frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>
          </div>

          {/* Scanning line animation */}
          {!isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 relative overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-primary animate-scan" />
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white space-y-3 p-4">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => startScanner()}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          {devices.length > 1 && (
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={switchCamera}
              aria-label="Switch camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <p className="text-white/80 text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
            Point camera at barcode or QR code
          </p>
        </div>
      </Card>
    );
  }
);

BarcodeScanner.displayName = "BarcodeScanner";
