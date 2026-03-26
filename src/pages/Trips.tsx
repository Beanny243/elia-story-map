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

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

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
      const { data } = await supabase.from("trips").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
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
    (t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-mesh">
      <motion.div initial="initial" animate="animate" variants={stagger} className="px-5 pt-14 pb-28 space-y-5">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">My Trips</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your travel adventures</p>
        </motion.div>

        <motion.div variants={fadeUp} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            className="pl-10 rounded-2xl bg-card border-border/30 shadow-card h-12 text-sm focus-visible:shadow-glow focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-3">
          {!isPremium && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(trips.length / FREE_LIMITS.maxTrips) * 100}%` }}
                    className="h-full gradient-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{trips.length}/{FREE_LIMITS.maxTrips} trips</p>
              </div>
              <button onClick={() => navigate("/subscription")} className="text-xs font-bold flex items-center gap-1 text-gradient-accent">
                <Crown className="h-3 w-3 text-accent" /> Upgrade
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
            className="w-full rounded-2xl gap-2 gradient-primary text-white h-13 font-bold text-sm shadow-glow border-0 transition-all duration-300 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create New Trip
          </Button>
        </motion.div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Luggage className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{trips.length === 0 ? "No trips yet" : "No matches"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trips.length === 0 ? "Create your first trip to get started!" : "Try a different search term."}
                </p>
              </div>
            </motion.div>
          ) : (
            filtered.map((trip, i) => (
              <motion.div key={trip.id} variants={fadeUp}>
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
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[320px] rounded-2xl border-border/30 shadow-elevated">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete trip?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the trip and all its stops, itinerary, and linked data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trips;
