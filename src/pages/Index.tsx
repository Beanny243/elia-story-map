import { Globe, Building2, Compass, Route, Sparkles, Plus, BookOpen, MapPin, Utensils, Camera, Music, BookOpenText, Leaf, Heart, Crown } from "lucide-react";
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

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscriptionGate();
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

    // Add style-based suggestions
    if (profile.travel_style && STYLE_SUGGESTIONS[profile.travel_style]) {
      suggestions.push(...STYLE_SUGGESTIONS[profile.travel_style]);
    }

    // Add interest-based suggestions
    const interests = profile.interests as string[] | null;
    if (interests?.length) {
      for (const interest of interests.slice(0, 2)) {
        if (INTEREST_SUGGESTIONS[interest]) {
          suggestions.push(INTEREST_SUGGESTIONS[interest]);
        }
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
    <div className="px-5 pt-12 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{greeting()} 👋</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : " to Eliamap"}
          </h1>
          <p className="text-xs text-muted-foreground italic">Every journey becomes a story.</p>
        </div>
        <NotificationCenter />
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
        <EliMascot message={mascotMessage} size="sm" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-4 gap-2">
        <StatCard icon={Globe} label="Countries" value={profile?.countries_visited ?? 0} />
        <StatCard icon={Building2} label="Cities" value={profile?.cities_visited ?? 0} />
        <StatCard icon={Compass} label="Trips" value={trips.length} />
        <StatCard icon={Route} label="km" value={profile?.total_distance_km ? `${Math.round(profile.total_distance_km / 1000)}k` : "0"} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-2">
        <Button onClick={() => navigate("/trips/create")} className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" /> Plan Trip
        </Button>
        <Button variant="outline" onClick={() => navigate("/ai-itinerary")} className="flex-1 rounded-xl border-accent text-accent hover:bg-accent/10 gap-2 relative">
          <Sparkles className="h-4 w-4" /> AI Itinerary
          {!isPremium && <Crown className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-primary fill-primary" />}
        </Button>
        <Button variant="outline" onClick={() => navigate("/memories")} className="rounded-xl gap-2 px-3">
          <BookOpen className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Personalized Suggestions */}
      {personalizedSuggestions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display font-bold text-lg text-foreground">For You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {personalizedSuggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => s.action && navigate(s.action)}
                className="flex-shrink-0 w-44 bg-card rounded-2xl p-4 border border-border text-left shadow-sm hover:border-accent/40 transition-colors"
              >
                <span className="text-2xl mb-2 block">{s.emoji}</span>
                <h3 className="text-sm font-bold text-foreground leading-tight">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Recent Trips</h2>
          <button onClick={() => navigate("/trips")} className="text-xs text-accent font-semibold">See all</button>
        </div>
        {trips.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No trips yet. Create your first one!</p>
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

      {/* Community & Journal Quick Links */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground">Explore</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/community")} className="bg-card rounded-2xl p-4 shadow-card text-left space-y-2 hover:shadow-md transition-shadow">
            <span className="text-2xl">🌍</span>
            <p className="text-sm font-bold text-foreground">Community</p>
            <p className="text-[10px] text-muted-foreground">Share & discover experiences</p>
          </button>
          <button onClick={() => navigate("/spotting-journal")} className="bg-card rounded-2xl p-4 shadow-card text-left space-y-2 hover:shadow-md transition-shadow">
            <span className="text-2xl">🔭</span>
            <p className="text-sm font-bold text-foreground">Spotting Journal</p>
            <p className="text-[10px] text-muted-foreground">Log your travel discoveries</p>
          </button>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Recent Memories</h2>
          <button onClick={() => navigate("/memories")} className="text-xs text-accent font-semibold">See all</button>
        </div>
        {memories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No memories yet. Add your first one!</p>
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
