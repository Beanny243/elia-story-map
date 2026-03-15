import { Globe, Building2, Compass, Route, Sparkles, Plus, BookOpen, Crown } from "lucide-react";
import NotificationCenter from "@/components/shared/NotificationCenter";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import TripCard from "@/components/shared/TripCard";
import MemoryCard from "@/components/shared/MemoryCard";
import EliMascot from "@/components/shared/EliMascot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCoverImageForDestination } from "@/lib/cover-images";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

type Suggestion = { title: string; description: string; emoji: string; action?: string };

const STYLE_SUGGESTIONS: Record<string, Suggestion[]> = {
  backpacker: [
    { title: "Southeast Asia Loop", description: "Budget-friendly trail through Thailand, Vietnam & Cambodia", emoji: "🎒", action: "/trips/create" },
    { title: "Hostel Hopping Europe", description: "Interrail across 5 countries in 3 weeks", emoji: "🚂", action: "/trips/create" },
  ],
  luxury: [
    { title: "Maldives Retreat", description: "Overwater villas & private dining experiences", emoji: "🏝️", action: "/trips/create" },
    { title: "Swiss Alps Escape", description: "5-star chalets with mountain panoramas", emoji: "🏔️", action: "/trips/create" },
  ],
  adventure: [
    { title: "Patagonia Trek", description: "Hike Torres del Paine & glaciers", emoji: "🧗", action: "/trips/create" },
    { title: "Iceland Ring Road", description: "Volcanoes, waterfalls & northern lights", emoji: "🌋", action: "/trips/create" },
  ],
  cultural: [
    { title: "Japan Heritage Trail", description: "Temples, tea ceremonies & ancient cities", emoji: "🏯", action: "/trips/create" },
    { title: "Morocco Discovery", description: "Medinas, riads & Sahara desert camps", emoji: "🕌", action: "/trips/create" },
  ],
  relaxation: [
    { title: "Bali Wellness Retreat", description: "Yoga, spas & rice terrace walks", emoji: "🧘", action: "/trips/create" },
    { title: "Greek Island Hopping", description: "Sun, sea & slow living in the Cyclades", emoji: "☀️", action: "/trips/create" },
  ],
  road_trip: [
    { title: "Pacific Coast Highway", description: "San Francisco to LA along the coast", emoji: "🚗", action: "/trips/create" },
    { title: "New Zealand Campervan", description: "North & South Island scenic routes", emoji: "🚐", action: "/trips/create" },
  ],
};

const INTEREST_SUGGESTIONS: Record<string, Suggestion> = {
  food: { title: "Food Crawl", description: "Discover local street food & hidden gems", emoji: "🍜" },
  photography: { title: "Photo Walk", description: "Capture stunning golden-hour shots", emoji: "📸" },
  nightlife: { title: "Nightlife Guide", description: "Top bars, clubs & live music spots", emoji: "🎶" },
  history: { title: "History Deep Dive", description: "Museums, ruins & walking tours", emoji: "📚" },
  nature: { title: "Nature Escape", description: "National parks & scenic trails", emoji: "🌿" },
  romance: { title: "Romantic Getaway", description: "Sunset dinners & couple experiences", emoji: "💕" },
};

const FREQUENCY_MESSAGES: Record<string, string> = {
  yearly: "Make your annual trip unforgettable!",
  few_times: "Your next adventure awaits — let's plan it!",
  monthly: "Explorer mode ON — where to next?",
  nomad: "Home is wherever you are — keep moving!",
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscriptionGate();
  const { isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [tripStopCounts, setTripStopCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, tripsRes, memoriesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("trips").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("memories").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(2),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (tripsRes.data) {
        setTrips(tripsRes.data);
        const counts: Record<string, number> = {};
        for (const trip of tripsRes.data) {
          const { count } = await supabase.from("trip_stops").select("*", { count: "exact", head: true }).eq("trip_id", trip.id);
          counts[trip.id] = count || 0;
        }
        setTripStopCounts(counts);
      }
      if (memoriesRes.data) setMemories(memoriesRes.data);
    };
    fetchData();
  }, [user]);

  const personalizedSuggestions = useMemo(() => {
    if (!profile) return [];
    const suggestions: Suggestion[] = [];
    if (profile.travel_style && STYLE_SUGGESTIONS[profile.travel_style]) {
      suggestions.push(...STYLE_SUGGESTIONS[profile.travel_style]);
    }
    const interests = profile.interests as string[] | null;
    if (interests?.length) {
      for (const interest of interests.slice(0, 2)) {
        if (INTEREST_SUGGESTIONS[interest]) suggestions.push(INTEREST_SUGGESTIONS[interest]);
      }
    }
    return suggestions.slice(0, 4);
  }, [profile]);

  const mascotMessage = useMemo(() => {
    if (!profile) return "Plan your first trip to get started!";
    if (trips.length > 0) {
      return profile.trip_frequency && FREQUENCY_MESSAGES[profile.trip_frequency]
        ? FREQUENCY_MESSAGES[profile.trip_frequency]
        : "Ready for your next adventure?";
    }
    return profile.travel_style
      ? `I see you love ${profile.travel_style} travel — let's plan something!`
      : "Plan your first trip to get started!";
  }, [profile, trips]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="px-5 pt-14 pb-6 space-y-7">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{greeting()} 👋</p>
          <h1 className="text-[22px] font-display font-bold text-foreground tracking-tight">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : " to Eliamap"}
          </h1>
          <p className="text-xs text-muted-foreground">Every journey becomes a story.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-foreground shadow-card transition-all duration-200 hover:shadow-elevated"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationCenter />
        </div>
      </motion.div>

      {/* Mascot */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <EliMascot message={mascotMessage} size="sm" />
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="grid grid-cols-4 gap-2">
        <StatCard icon={Globe} label="Countries" value={profile?.countries_visited ?? 0} />
        <StatCard icon={Building2} label="Cities" value={profile?.cities_visited ?? 0} />
        <StatCard icon={Compass} label="Trips" value={trips.length} />
        <StatCard icon={Route} label="km" value={profile?.total_distance_km ? `${Math.round(profile.total_distance_km / 1000)}k` : "0"} />
      </motion.div>

      {/* Action Buttons */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex gap-2">
        <Button
          onClick={() => navigate("/trips/create")}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-card"
        >
          <Plus className="h-4 w-4" /> Plan Trip
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/ai-itinerary")}
          className="flex-1 h-11 rounded-xl border-border text-foreground hover:bg-accent/10 hover:border-accent/40 gap-2 relative font-semibold"
        >
          <Sparkles className="h-4 w-4 text-accent" /> AI Itinerary
          {!isPremium && <Crown className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-accent fill-accent" />}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/memories")}
          className="h-11 rounded-xl gap-2 px-3 border-border hover:bg-muted"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Personalized Suggestions */}
      {personalizedSuggestions.length > 0 && (
        <motion.section {...fadeUp} transition={{ delay: 0.25 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </div>
            <h2 className="font-display font-bold text-base text-foreground">For You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {personalizedSuggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => s.action && navigate(s.action)}
                className="flex-shrink-0 w-40 bg-card rounded-2xl p-3.5 border border-border/40 text-left shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-2xl mb-2 block">{s.emoji}</span>
                <h3 className="text-[13px] font-bold text-foreground leading-tight">{s.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{s.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Trips */}
      <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-foreground">Recent Trips</h2>
          <button onClick={() => navigate("/trips")} className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors">See all →</button>
        </div>
        {trips.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-8 text-center shadow-card">
            <p className="text-2xl mb-2">✈️</p>
            <p className="text-sm font-medium text-foreground">No trips yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first trip to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={trip.title}
                destination={trip.destination}
                coverImage={trip.cover_image || getCoverImageForDestination(trip.destination)}
                startDate={trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                endDate={trip.end_date ? new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                stops={tripStopCounts[trip.id] || 0}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Explore */}
      <motion.section {...fadeUp} transition={{ delay: 0.35 }} className="space-y-3">
        <h2 className="font-display font-bold text-base text-foreground">Explore</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/community")}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/40 text-left space-y-2 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🌍</div>
            <p className="text-sm font-bold text-foreground">Community</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Share & discover experiences</p>
          </button>
          <button
            onClick={() => navigate("/spotting-journal")}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/40 text-left space-y-2 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl">🔭</div>
            <p className="text-sm font-bold text-foreground">Spotting Journal</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Log your travel discoveries</p>
          </button>
        </div>
      </motion.section>

      {/* Recent Memories */}
      <motion.section {...fadeUp} transition={{ delay: 0.4 }} className="space-y-3 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-foreground">Recent Memories</h2>
          <button onClick={() => navigate("/memories")} className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors">See all →</button>
        </div>
        {memories.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-8 text-center shadow-card">
            <p className="text-2xl mb-2">📸</p>
            <p className="text-sm font-medium text-foreground">No memories yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first memory!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((m) => (
              <MemoryCard
                key={m.id}
                photo={m.photo_url || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                location={m.location || "Unknown"}
                date={m.memory_date ? new Date(m.memory_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                caption={m.caption || ""}
              />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Index;
