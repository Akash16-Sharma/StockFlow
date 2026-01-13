import { Product } from "@/types/inventory";
import JsBarcode from "jsbarcode";
import QRCode from "react-qr-code";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

export type PrintCodeType = "barcode" | "qrcode";

interface PrintOptions {
  products: Product[];
  codeType: PrintCodeType;
  labelsPerRow?: number;
}

function generateBarcodeSvg(value: string): string {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");

  try {
    JsBarcode(svg, value, {
      format: "CODE128",
      width: 1.6,
      height: 52,
      displayValue: true,
      fontSize: 12,
      margin: 6,
      background: "#ffffff",
      lineColor: "#000000",
    });

    svg.classList.add("barcode-svg");
    return new XMLSerializer().serializeToString(svg);
  } catch (error) {
    console.error("Barcode generation error:", error);
    return `<svg class="barcode-svg" viewBox="0 0 200 60"><text x="0" y="20" fill="#000">Invalid barcode</text></svg>`;
  }
}

function generateQRCodeSvg(value: string): string {
  try {
    const qrElement = createElement(QRCode, {
      value,
      size: 128,
      level: "M",
      bgColor: "#ffffff",
      fgColor: "#000000",
    });

    const markup = renderToStaticMarkup(qrElement);
    // Ensure the SVG has a class so we can size it reliably in print CSS
    return markup.replace("<svg", '<svg class="qr-svg"');
  } catch (error) {
    console.error("QR code generation error:", error);
    return `<svg class="qr-svg" viewBox="0 0 200 200"><text x="0" y="20" fill="#000">Invalid QR</text></svg>`;
  }
}

export function generatePrintContent(options: PrintOptions): string {
  const { products, codeType, labelsPerRow = 3 } = options;

  const labels = products.map((product) => {
    const codeValue = product.barcode || product.sku;
    const codeSvg = codeType === "qrcode" 
      ? generateQRCodeSvg(codeValue)
      : generateBarcodeSvg(codeValue);
    
    return `
      <div class="label">
        <div class="code-container">
          ${codeSvg}
        </div>
        <div class="product-name">${product.name}</div>
        <div class="product-sku">${codeValue}</div>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Labels</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 10mm;
          background: white;
        }
        
        .labels-container {
          display: grid;
          grid-template-columns: repeat(${labelsPerRow}, 1fr);
          gap: 5mm;
        }
        
        .label {
          border: 1px dashed #ccc;
          padding: 4mm;
          text-align: center;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 35mm;
          background: white;
        }
        
        .code-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 2mm;
          width: 100%;
        }

        .barcode-svg {
          width: 100%;
          max-width: 60mm;
          height: auto;
        }

        .qr-svg {
          width: 28mm;
          height: 28mm;
        }
        
        .product-name {
          font-size: 9pt;
          font-weight: 600;
          margin-top: 2mm;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .product-sku {
          font-size: 7pt;
          color: #666;
          margin-top: 1mm;
        }
        
        @media print {
          body {
            padding: 5mm;
          }
          
          .label {
            border: 1px dashed #ddd;
          }
          
          @page {
            margin: 5mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="labels-container">
        ${labels.join("")}
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}

export function printLabels(options: PrintOptions): void {
  const content = generatePrintContent(options);
  const printWindow = window.open("", "_blank");
  
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
  }
}
