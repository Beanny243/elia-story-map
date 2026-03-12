import { Globe, Building2, Compass, Route, Sparkles, Plus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import TripCard from "@/components/shared/TripCard";
import MemoryCard from "@/components/shared/MemoryCard";
import EliMascot from "@/components/shared/EliMascot";

const mockTrips = [
  {
    id: "1",
    title: "Italian Summer",
    destination: "Italy",
    coverImage: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80",
    startDate: "Jun 12",
    endDate: "Jun 22",
    stops: 4,
  },
  {
    id: "2",
    title: "Tokyo Nights",
    destination: "Japan",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    startDate: "Mar 1",
    endDate: "Mar 10",
    stops: 6,
  },
];

const mockMemories = [
  {
    photo: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    location: "Paris, France",
    date: "Apr 15",
    caption: "Golden hour at the Eiffel Tower ✨",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground font-medium">Good morning 👋</p>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome to Eliamap</h1>
        <p className="text-xs text-muted-foreground italic">Every journey becomes a story.</p>
      </motion.div>

      {/* Eli Mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <EliMascot message="Ready for your next adventure?" size="sm" />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-4 gap-2"
      >
        <StatCard icon={Globe} label="Countries" value={8} />
        <StatCard icon={Building2} label="Cities" value={23} />
        <StatCard icon={Compass} label="Trips" value={12} />
        <StatCard icon={Route} label="km" value="14k" />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2"
      >
        <Button
          onClick={() => navigate("/trips/create")}
          className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" /> Plan Trip
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-accent text-accent hover:bg-accent/10 gap-2"
        >
          <Sparkles className="h-4 w-4" /> AI Itinerary
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/memories")}
          className="rounded-xl gap-2 px-3"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Recent Trips */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Recent Trips</h2>
          <button onClick={() => navigate("/trips")} className="text-xs text-accent font-semibold">See all</button>
        </div>
        <div className="space-y-3">
          {mockTrips.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      </motion.section>

      {/* Recent Memories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 pb-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Recent Memories</h2>
          <button onClick={() => navigate("/memories")} className="text-xs text-accent font-semibold">See all</button>
        </div>
        <div className="space-y-3">
          {mockMemories.map((m, i) => (
            <MemoryCard key={i} {...m} />
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
