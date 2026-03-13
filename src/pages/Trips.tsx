import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripCard from "@/components/shared/TripCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Trips = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stopCounts, setStopCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setTrips(data);
        const counts: Record<string, number> = {};
        for (const trip of data) {
          const { count } = await supabase.from("trip_stops").select("*", { count: "exact", head: true }).eq("trip_id", trip.id);
          counts[trip.id] = count || 0;
        }
        setStopCounts(counts);
      }
    };
    fetchTrips();
  }, [user]);

  const filtered = trips.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-12 space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">My Trips</h1>
        <p className="text-sm text-muted-foreground">Your travel adventures</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          className="pl-9 rounded-xl bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Button onClick={() => navigate("/trips/create")} className="w-full rounded-xl gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Create New Trip
        </Button>
      </motion.div>

      <div className="space-y-3 pb-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {trips.length === 0 ? "No trips yet. Create your first one!" : "No trips match your search."}
          </p>
        ) : (
          filtered.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <TripCard
                id={trip.id}
                title={trip.title}
                destination={trip.destination}
                coverImage={trip.cover_image || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                startDate={trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                endDate={trip.end_date ? new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                stops={stopCounts[trip.id] || 0}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Trips;
