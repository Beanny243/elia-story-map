import { Plus, Search, Crown } from "lucide-react";
import { getCoverImageForDestination } from "@/lib/cover-images";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TripCard from "@/components/shared/TripCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionGate, FREE_LIMITS } from "@/hooks/useSubscriptionGate";

const Trips = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, maxTrips } = useSubscriptionGate();
  const [trips, setTrips] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stopCounts, setStopCounts] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!tripToDelete) return;
    const { error } = await supabase.from("trips").delete().eq("id", tripToDelete);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete));
      toast({ title: "Trip deleted", description: "The trip has been removed." });
    }
    setTripToDelete(null);
    setDeleteDialogOpen(false);
  };

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
                coverImage={trip.cover_image || getCoverImageForDestination(trip.destination)}
                startDate={trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                endDate={trip.end_date ? new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                stops={stopCounts[trip.id] || 0}
                status={trip.status || "draft"}
                onEdit={() => navigate(`/trips/${trip.id}/edit`)}
                onDelete={() => { setTripToDelete(trip.id); setDeleteDialogOpen(true); }}
              />
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[320px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete trip?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the trip and all its stops, itinerary, and linked data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trips;
