import { Product } from "@/types/inventory";

// Sanitize input to prevent XSS
function sanitize(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/[<>\"'&]/g, "").trim();
}

// Parse CSV string to array of product objects
export function parseCSV(csvText: string): Partial<Product>[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const products: Partial<Product>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const product: Partial<Product> = {};

    headers.forEach((header, idx) => {
      const value = values[idx]?.trim();
      
      switch (header) {
        case "name":
          product.name = sanitize(value);
          break;
        case "sku":
          product.sku = sanitize(value);
          break;
        case "barcode":
          product.barcode = sanitize(value) || null;
          break;
        case "quantity":
          product.quantity = parseInt(value) || 0;
          break;
        case "minstock":
        case "min_stock":
        case "minimum stock":
          product.minStock = parseInt(value) || 0;
          break;
        case "expirydate":
        case "expiry_date":
        case "expiry date":
        case "expiry":
          product.expiryDate = value || null;
          break;
        case "category":
          product.category = sanitize(value) || "General";
          break;
      }
    });

    // Only add if required fields are present
    if (product.name && product.sku) {
      products.push(product);
    }
  }

  return products;
}

// Handle quoted CSV values with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Export products to CSV string
export function exportToCSV(products: Product[]): string {
  const headers = [
    "Name",
    "SKU",
    "Barcode",
    "Quantity",
    "Min Stock",
    "Expiry Date",
    "Category",
    "Created At",
    "Updated At",
  ];

  const rows = products.map((p) => [
    escapeCSV(p.name),
    escapeCSV(p.sku),
    escapeCSV(p.barcode || ""),
    p.quantity.toString(),
    p.minStock.toString(),
    p.expiryDate || "",
    escapeCSV(p.category),
    p.createdAt,
    p.updatedAt,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Download CSV file
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Generate CSV template
export function getCSVTemplate(): string {
  return "Name,SKU,Barcode,Quantity,MinStock,ExpiryDate,Category\nExample Product,SKU001,123456789,100,10,2025-12-31,Electronics";
}
