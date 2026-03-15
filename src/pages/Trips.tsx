import { Plus, Search, Crown, Luggage } from "lucide-react";
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
    <div className="px-5 pt-12 pb-28 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">My Trips</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your travel adventures</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          className="pl-10 rounded-2xl bg-card border-border/50 shadow-sm h-11 text-sm focus-visible:ring-primary/30"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
        {!isPremium && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 min-w-[80px] bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(trips.length / FREE_LIMITS.maxTrips) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {trips.length}/{FREE_LIMITS.maxTrips} trips
              </p>
            </div>
            <button onClick={() => navigate("/subscription")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
              <Crown className="h-3 w-3" /> Upgrade
            </button>
          </div>
        )}
        <Button
          onClick={() => {
            if (!isPremium && trips.length >= maxTrips) {
              toast({ title: "Trip limit reached", description: `Free plan allows ${FREE_LIMITS.maxTrips} trips. Upgrade to create more!`, variant: "destructive" });
              navigate("/subscription");
              return;
            }
            navigate("/trips/create");
          }}
          className="w-full rounded-2xl gap-2 bg-primary text-primary-foreground h-12 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Create New Trip
        </Button>
      </motion.div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Luggage className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {trips.length === 0 ? "No trips yet. Create your first one!" : "No trips match your search."}
            </p>
          </motion.div>
        ) : (
          filtered.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
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
        <AlertDialogContent className="max-w-[320px] rounded-2xl border-border/50 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete trip?</AlertDialogTitle>
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
