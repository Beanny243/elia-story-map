import { useAuth } from "@/contexts/AuthContext";

export const FREE_LIMITS = {
  maxTrips: 3,
  maxMemories: 5,
} as const;

export function useSubscriptionGate() {
  const { subscription } = useAuth();

  const isPremium = subscription.subscribed;
  const isLoading = subscription.loading;

  return {
    isPremium,
    isLoading,
    canUseAI: isPremium,
    canUseMap: isPremium,
    maxTrips: isPremium ? Infinity : FREE_LIMITS.maxTrips,
    maxMemories: isPremium ? Infinity : FREE_LIMITS.maxMemories,
  };
}
