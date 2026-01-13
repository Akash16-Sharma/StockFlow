import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PlanType, SubscriptionStatus, PLAN_LIMITS, TRIAL_DAYS } from "@/lib/plans";
import { differenceInDays } from "date-fns";

interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  trialEndsAt: Date;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
}

interface DbSubscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  trial_ends_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

function mapDbToSubscription(db: DbSubscription): Subscription {
  return {
    id: db.id,
    userId: db.user_id,
    plan: db.plan,
    status: db.status,
    trialEndsAt: new Date(db.trial_ends_at),
    currentPeriodStart: db.current_period_start ? new Date(db.current_period_start) : null,
    currentPeriodEnd: db.current_period_end ? new Date(db.current_period_end) : null,
    createdAt: new Date(db.created_at),
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no subscription exists (for existing users), create one
      if (!data) {
        const { data: newSub, error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan: 'starter' as PlanType,
            status: 'trialing' as SubscriptionStatus,
            trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return mapDbToSubscription(newSub as DbSubscription);
      }
      
      return mapDbToSubscription(data as DbSubscription);
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
  });

  const updatePlan = useMutation({
    mutationFn: async (newPlan: PlanType) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .update({ 
          plan: newPlan,
          status: 'active' as SubscriptionStatus,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToSubscription(data as DbSubscription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  const subscription = subscriptionQuery.data;
  const plan = subscription?.plan ?? 'starter';
  const limits = PLAN_LIMITS[plan];

  // Calculate trial status
  const isTrialing = subscription?.status === 'trialing';
  const trialDaysRemaining = subscription?.trialEndsAt 
    ? Math.max(0, differenceInDays(subscription.trialEndsAt, new Date()))
    : 0;
  const isTrialExpired = isTrialing && trialDaysRemaining <= 0;

  // Check if subscription is active (trialing or paid)
  const isActive = subscription?.status === 'active' || (isTrialing && !isTrialExpired);

  // Feature checks
  const canAddProduct = (currentCount: number) => {
    return currentCount < limits.maxProducts;
  };

  const canAddTeamMember = (currentCount: number) => {
    return currentCount < limits.maxTeamMembers;
  };

  const hasFeature = (feature: keyof typeof limits.features) => {
    return limits.features[feature];
  };

  // Get remaining product slots
  const getRemainingProducts = (currentCount: number) => {
    if (limits.maxProducts === Infinity) return Infinity;
    return Math.max(0, limits.maxProducts - currentCount);
  };

  // Get remaining team member slots
  const getRemainingTeamMembers = (currentCount: number) => {
    if (limits.maxTeamMembers === Infinity) return Infinity;
    return Math.max(0, limits.maxTeamMembers - currentCount);
  };

  return {
    subscription,
    plan,
    limits,
    isLoading: subscriptionQuery.isLoading,
    isTrialing,
    trialDaysRemaining,
    isTrialExpired,
    isActive,
    canAddProduct,
    canAddTeamMember,
    hasFeature,
    getRemainingProducts,
    getRemainingTeamMembers,
    updatePlan,
    refetch: subscriptionQuery.refetch,
  };
}
