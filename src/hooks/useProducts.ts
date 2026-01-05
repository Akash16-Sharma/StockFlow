import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Product } from "@/types/inventory";
import { toast } from "sonner";

type DbProduct = {
  id: string;
  user_id: string;
  name: string;
  sku: string;
  barcode: string | null;
  quantity: number;
  min_stock: number;
  expiry_date: string | null;
  category: string;
  created_at: string;
  updated_at: string;
};

// Map database product to frontend Product type
function mapDbToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    sku: db.sku,
    barcode: db.barcode,
    quantity: db.quantity,
    minStock: db.min_stock,
    expiryDate: db.expiry_date,
    category: db.category,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function useProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Optimized: only select needed columns, add index-friendly ordering
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, barcode, quantity, min_stock, expiry_date, category, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500); // Prevent fetching too many records

      if (error) throw error;
      return (data as DbProduct[]).map(mapDbToProduct);
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds - reduces refetches
    gcTime: 300000, // Keep in cache for 5 minutes (previously cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on tab focus - saves API calls
  });

  const addProduct = useMutation({
    mutationFn: async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: product.name.trim(),
          sku: product.sku.trim(),
          barcode: product.barcode?.trim() || null,
          quantity: product.quantity,
          min_stock: product.minStock,
          expiry_date: product.expiryDate || null,
          category: product.category?.trim() || "General",
        })
        .select("id, name, sku, barcode, quantity, min_stock, expiry_date, category, created_at, updated_at")
        .single();

      if (error) throw error;
      return mapDbToProduct(data as DbProduct);
    },
    onSuccess: (data) => {
      // Optimistic: add to cache instead of full refetch
      queryClient.setQueryData(
        ["products", user?.id],
        (old: Product[] | undefined) => (old ? [data, ...old] : [data])
      );
      toast.success("Product added", {
        description: `"${data.name}" has been added to your inventory.`,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate key")) {
        toast.error("Duplicate SKU", {
          description: "A product with this SKU already exists.",
        });
      } else {
        toast.error("Could not add product", {
          description: "Please check your connection and try again.",
        });
      }
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      silent,
      ...updates
    }: Partial<Product> & { id: string; silent?: boolean }) => {
      // Build update object with only changed fields
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.sku !== undefined) updateData.sku = updates.sku.trim();
      if (updates.barcode !== undefined) updateData.barcode = updates.barcode?.trim() || null;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
      if (updates.expiryDate !== undefined) updateData.expiry_date = updates.expiryDate || null;
      if (updates.category !== undefined) updateData.category = updates.category?.trim() || "General";

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select("id, name, sku, barcode, quantity, min_stock, expiry_date, category, created_at, updated_at")
        .single();

      if (error) throw error;
      return { product: mapDbToProduct(data as DbProduct), silent };
    },
    onMutate: async ({ id, ...updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["products", user?.id] });
      const previousProducts = queryClient.getQueryData<Product[]>(["products", user?.id]);

      queryClient.setQueryData(
        ["products", user?.id],
        (old: Product[] | undefined) =>
          old?.map((p) => (p.id === id ? { ...p, ...updates } : p)) ?? []
      );

      return { previousProducts };
    },
    onSuccess: ({ product, silent }) => {
      if (!silent) {
        toast.success("Changes saved", {
          description: `"${product.name}" has been updated.`,
        });
      }
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(["products", user?.id], context.previousProducts);
      }
      if (error.message.includes("duplicate key")) {
        toast.error("Duplicate SKU", {
          description: "Another product already uses this SKU.",
        });
      } else {
        toast.error("Could not save changes", {
          description: "Please check your connection and try again.",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products", user?.id] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: ["products", user?.id] });
      const previousProducts = queryClient.getQueryData<Product[]>(["products", user?.id]);

      queryClient.setQueryData(
        ["products", user?.id],
        (old: Product[] | undefined) => old?.filter((p) => p.id !== id) ?? []
      );

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success("Product removed", {
        description: "The product has been deleted from your inventory.",
      });
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(["products", user?.id], context.previousProducts);
      }
      toast.error("Could not delete product", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products", user?.id] });
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    refetch: productsQuery.refetch,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
