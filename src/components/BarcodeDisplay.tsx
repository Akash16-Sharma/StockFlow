import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { cn } from "@/lib/utils";

interface BarcodeDisplayProps {
  value: string;
  format?: "CODE128" | "EAN13" | "UPC" | "CODE39";
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export function BarcodeDisplay({
  value,
  format = "CODE128",
  width = 2,
  height = 50,
  displayValue = true,
  className,
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          margin: 10,
          fontSize: 12,
          background: "transparent",
          lineColor: "currentColor",
        });
      } catch (error) {
        console.error("Barcode generation error:", error);
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value) return null;

  return (
    <div className={cn("flex justify-center", className)}>
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
}
