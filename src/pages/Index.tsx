import { Globe, Building2, Compass, Route, Sparkles, Plus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import TripCard from "@/components/shared/TripCard";
import MemoryCard from "@/components/shared/MemoryCard";
import EliMascot from "@/components/shared/EliMascot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        // Fetch stop counts
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="px-5 pt-12 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{greeting()} 👋</p>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : " to Eliamap"}
        </h1>
        <p className="text-xs text-muted-foreground italic">Every journey becomes a story.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
        <EliMascot message={trips.length > 0 ? "Ready for your next adventure?" : "Plan your first trip to get started!"} size="sm" />
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
        <Button variant="outline" className="flex-1 rounded-xl border-accent text-accent hover:bg-accent/10 gap-2">
          <Sparkles className="h-4 w-4" /> AI Itinerary
        </Button>
        <Button variant="outline" onClick={() => navigate("/memories")} className="rounded-xl gap-2 px-3">
          <BookOpen className="h-4 w-4" />
        </Button>
      </motion.div>

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
                coverImage={trip.cover_image || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                startDate={trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                endDate={trip.end_date ? new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                stops={tripStopCounts[trip.id] || 0}
              />
            ))}
          </div>
        )}
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
