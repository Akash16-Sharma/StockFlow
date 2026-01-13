// SKU generation utilities

const categoryPrefixes: Record<string, string> = {
  "General": "GEN",
  "Electronics": "ELE",
  "Food & Beverage": "FNB",
  "Clothing": "CLO",
  "Health & Beauty": "HNB",
  "Home & Garden": "HNG",
  "Office Supplies": "OFF",
  "Sports & Outdoors": "SPO",
  "Toys & Games": "TOY",
  "Other": "OTH",
};

/**
 * Generates a unique SKU based on category and timestamp
 * Format: PREFIX-XXXXXX (e.g., ELE-A3B7K2)
 */
export function generateSKU(category: string = "General"): string {
  const prefix = categoryPrefixes[category] || "GEN";
  
  // Generate a 6-character alphanumeric code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  
  // Use timestamp + random for uniqueness
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Array.from(
    { length: 6 - Math.min(timestamp.length, 3) }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  
  code = (timestamp.slice(-3) + randomPart).slice(0, 6);
  
  return `${prefix}-${code}`;
}

/**
 * List of predefined categories
 */
export const PRODUCT_CATEGORIES = [
  "General",
  "Electronics",
  "Food & Beverage",
  "Clothing",
  "Health & Beauty",
  "Home & Garden",
  "Office Supplies",
  "Sports & Outdoors",
  "Toys & Games",
  "Other",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
