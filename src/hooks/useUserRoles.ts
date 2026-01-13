import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppRole, Profile } from "@/types/inventory";
import { toast } from "sonner";

export function useUserRoles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const isAdminQuery = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  // Get all user profiles (admin only)
  const usersQuery = useQuery({
    queryKey: ["all-users", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          invited_by,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        invitedBy: p.invited_by,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) as Profile[];
    },
    enabled: !!user && isAdminQuery.data === true,
    staleTime: 30000,
  });

  // Get roles for all users
  const rolesQuery = useQuery({
    queryKey: ["all-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (error) throw error;
      
      const roleMap: Record<string, AppRole[]> = {};
      data.forEach((r) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role as AppRole);
      });
      return roleMap;
    },
    enabled: !!user && isAdminQuery.data === true,
    staleTime: 30000,
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-roles"] });
      toast.success("Role assigned");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to assign role");
      }
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-roles"] });
      toast.success("Role removed");
    },
    onError: () => {
      toast.error("Failed to remove role");
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Use edge function to properly delete from auth.users (allows re-invitation)
      const { data, error } = await supabase.functions.invoke("delete-staff", {
        body: { userId, adminId: user?.id },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["all-roles"] });
      toast.success("Team member removed");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove team member", { description: error.message });
    },
  });

  return {
    isAdmin: isAdminQuery.data ?? false,
    isAdminLoading: isAdminQuery.isLoading,
    users: usersQuery.data ?? [],
    userRoles: rolesQuery.data ?? {},
    assignRole,
    removeRole,
    deleteUser,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["all-roles"] });
    },
  };
}
