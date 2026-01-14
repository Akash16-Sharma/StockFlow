import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StockMovement, MovementType } from "@/types/inventory";
import { toast } from "sonner";

type DbStockMovement = {
  id: string;
  product_id: string;
  user_id: string;
  movement_type: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  notes: string | null;
  created_at: string;
};

function mapDbToMovement(db: DbStockMovement): StockMovement {
  return {
    id: db.id,
    productId: db.product_id,
    userId: db.user_id,
    movementType: db.movement_type as MovementType,
    quantityChange: db.quantity_change,
    quantityBefore: db.quantity_before,
    quantityAfter: db.quantity_after,
    notes: db.notes,
    createdAt: db.created_at,
  };
}

export function useStockMovements(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const movementsQuery = useQuery({
    queryKey: ["stock-movements", productId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as DbStockMovement[]).map(mapDbToMovement);
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const addMovement = useMutation({
    mutationFn: async ({
      productId,
      movementType,
      quantityChange,
      quantityBefore,
      notes,
    }: {
      productId: string;
      movementType: MovementType;
      quantityChange: number;
      quantityBefore: number;
      notes?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const quantityAfter = quantityBefore + quantityChange;

      const { data, error } = await supabase
        .from("stock_movements")
        .insert({
          product_id: productId,
          user_id: user.id,
          movement_type: movementType,
          quantity_change: quantityChange,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToMovement(data as DbStockMovement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    },
    onError: () => {
      toast.error("Failed to record stock movement");
    },
  });

  return {
    movements: movementsQuery.data ?? [],
    isLoading: movementsQuery.isLoading,
    addMovement,
    refetch: movementsQuery.refetch,
  };
}
