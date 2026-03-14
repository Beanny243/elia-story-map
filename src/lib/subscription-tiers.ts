// EliaMap subscription tiers mapped to Stripe product/price IDs
export const SUBSCRIPTION_TIERS = {
  weekly: {
    name: "Weekly",
    price: "$9",
    interval: "week",
    priceId: "price_1TB1m7FBFTQVnk0UPcHGUKtM",
    productId: "prod_U9KQyPRKvcAXut",
    features: [
      "Unlimited trip planning",
      "AI itinerary generation",
      "Memory journal",
      "Map visualization",
    ],
  },
  monthly: {
    name: "Monthly",
    price: "$29",
    interval: "month",
    priceId: "price_1TB1m7FBFTQVnk0UteB5f4DK",
    productId: "prod_U9KQExJJmZfZb0",
    popular: true,
    features: [
      "Everything in Weekly",
      "Priority AI responses",
      "Advanced trip analytics",
      "Offline access",
    ],
  },
  yearly: {
    name: "Yearly",
    price: "$199",
    interval: "year",
    priceId: "price_1TB1m8FBFTQVnk0UmG5FZMq6",
    productId: "prod_U9KR0aQEoltHps",
    savings: "Save 36%",
    features: [
      "Everything in Monthly",
      "Early access to features",
      "Premium support",
      "Unlimited storage",
    ],
  },
} as const;

export type TierKey = keyof typeof SUBSCRIPTION_TIERS;

export function getTierByPriceId(priceId: string): TierKey | null {
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.priceId === priceId) return key as TierKey;
  }
  return null;
}

export function getTierByProductId(productId: string): TierKey | null {
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.productId === productId) return key as TierKey;
  }
  return null;
}
