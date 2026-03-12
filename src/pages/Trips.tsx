import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripCard from "@/components/shared/TripCard";

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
  {
    id: "3",
    title: "Greek Islands",
    destination: "Greece",
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80",
    startDate: "Aug 5",
    endDate: "Aug 15",
    stops: 5,
  },
  {
    id: "4",
    title: "NYC Weekend",
    destination: "USA",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    startDate: "Dec 20",
    endDate: "Dec 23",
    stops: 3,
  },
];

const Trips = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">My Trips</h1>
        <p className="text-sm text-muted-foreground">Your travel adventures</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search trips..." className="pl-9 rounded-xl bg-card" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Button onClick={() => navigate("/trips/create")} className="w-full rounded-xl gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Create New Trip
        </Button>
      </motion.div>

      <div className="space-y-3 pb-4">
        {mockTrips.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <TripCard {...trip} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Trips;
