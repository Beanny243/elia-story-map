import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Crown, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_TIERS, getTierByPriceId, TierKey } from "@/lib/subscription-tiers";

const Subscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);

  // Handle success/cancel redirects
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "🎉 Welcome to EliaMap!", description: "Your subscription is now active." });
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No charges were made." });
    }
  }, [searchParams, toast, checkSubscription]);

  const handleCheckout = async (tierKey: TierKey) => {
    const tier = SUBSCRIPTION_TIERS[tierKey];
    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setManagingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setManagingPortal(false);
    }
  };

  const activeTier = subscription.priceId ? getTierByPriceId(subscription.priceId) : null;

  return (
    <div className="px-5 pt-12 pb-28 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-card shadow-sm">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Subscription</h1>
      </motion.div>

      {/* Current status */}
      {subscription.subscribed && activeTier && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {subscription.isTrial ? "Free Trial" : "Active Plan"}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium">
            {SUBSCRIPTION_TIERS[activeTier].name} — {SUBSCRIPTION_TIERS[activeTier].price}/{SUBSCRIPTION_TIERS[activeTier].interval}
          </p>
          {subscription.subscriptionEnd && (
            <p className="text-xs text-muted-foreground mt-1">
              {subscription.isTrial ? "Trial ends" : "Renews"}: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
            </p>
          )}
          <Button
            onClick={handleManageSubscription}
            disabled={managingPortal}
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
          >
            {managingPortal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            Manage Subscription
          </Button>
        </motion.div>
      )}

      {/* Trial banner */}
      {!subscription.subscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-2xl bg-accent/30 border border-accent/40 text-center"
        >
          <Sparkles className="h-5 w-5 text-accent mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Start with a 3-day free trial</p>
          <p className="text-xs text-muted-foreground mt-1">No charge until the trial ends. Cancel anytime.</p>
        </motion.div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {(Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][]).map(
          ([key, tier], idx) => {
            const isActive = activeTier === key;
            const isPopular = "popular" in tier && tier.popular;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className={`relative p-5 rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-lg"
                    : isPopular
                    ? "border-accent bg-card shadow-md"
                    : "border-border bg-card"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Your Plan
                  </span>
                )}
                {isPopular && !isActive && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                {"savings" in tier && tier.savings && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {tier.savings}
                  </span>
                )}

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-display font-bold text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/{tier.interval}</span>
                </div>

                <ul className="space-y-2 mb-4">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(key)}
                  disabled={isActive || loadingTier !== null}
                  variant={isPopular || isActive ? "default" : "outline"}
                  className="w-full"
                >
                  {loadingTier === key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    "Current Plan"
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </motion.div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Subscription;
