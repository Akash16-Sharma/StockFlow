import { z } from "zod";

// XSS prevention: strip dangerous characters from text inputs
const sanitizedString = (maxLen: number) =>
  z
    .string()
    .trim()
    .max(maxLen, `Must be less than ${maxLen} characters`)
    .transform((val) => val.replace(/[<>]/g, "")); // Strip < and > to prevent XSS

export const productSchema = z.object({
  name: sanitizedString(100).refine((val) => val.length > 0, {
    message: "Product name is required",
  }),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters")
    .regex(
      /^[A-Za-z0-9-_]+$/,
      "SKU can only contain letters, numbers, hyphens and underscores"
    ),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(999999, "Quantity too large"),
  minStock: z
    .number({ invalid_type_error: "Min stock must be a number" })
    .int("Min stock must be a whole number")
    .min(0, "Min stock cannot be negative")
    .max(999999, "Min stock too large")
    .optional()
    .default(10),
  expiryDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" }
    ),
  category: sanitizedString(50).optional().default("General"),
  barcode: z
    .string()
    .trim()
    .max(100, "Barcode must be less than 100 characters")
    .regex(/^[A-Za-z0-9-]*$/, "Barcode can only contain alphanumeric characters and hyphens")
    .optional()
    .or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const productFormDefaults: ProductFormData = {
  name: "",
  sku: "",
  quantity: 0,
  minStock: 10,
  expiryDate: "",
  category: "General",
  barcode: "",
};

// Auth validation with stronger password requirements
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type AuthFormData = z.infer<typeof authSchema>;
