import { ArrowLeft, MapPin, Calendar, Plane, Train, Bus, Ship, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemoryCard from "@/components/shared/MemoryCard";

const transportIcons: Record<string, typeof Plane> = { flight: Plane, train: Train, bus: Bus, ferry: Ship };

const mockStops = [
  { city: "Rome", country: "Italy", arrive: "Jun 12", depart: "Jun 15", transport: "flight" },
  { city: "Florence", country: "Italy", arrive: "Jun 15", depart: "Jun 18", transport: "train" },
  { city: "Venice", country: "Italy", arrive: "Jun 18", depart: "Jun 20", transport: "train" },
  { city: "Milan", country: "Italy", arrive: "Jun 20", depart: "Jun 22", transport: "train" },
];

const mockItinerary = [
  { day: 1, title: "Arrival in Rome", activities: ["Check in to hotel", "Colosseum visit", "Dinner in Trastevere"] },
  { day: 2, title: "Roman Exploration", activities: ["Vatican Museums", "St. Peter's Basilica", "Gelato tasting"] },
  { day: 3, title: "Ancient Rome", activities: ["Roman Forum", "Pantheon", "Piazza Navona"] },
];

const TripDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative h-52">
        <img
          src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80"
          alt="Trip cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-4 p-2 rounded-xl bg-card/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-2xl font-display font-bold text-foreground">Italian Summer</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent" /> Italy • Jun 12–22, 2025
          </p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <Tabs defaultValue="stops">
          <TabsList className="w-full bg-secondary rounded-xl">
            <TabsTrigger value="stops" className="flex-1 rounded-lg text-xs">Stops</TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 rounded-lg text-xs">Itinerary</TabsTrigger>
            <TabsTrigger value="memories" className="flex-1 rounded-lg text-xs">Memories</TabsTrigger>
          </TabsList>

          <TabsContent value="stops" className="mt-4 space-y-2">
            {mockStops.map((stop, i) => {
              const TransportIcon = transportIcons[stop.transport] || Plane;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TransportIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{stop.city}</p>
                    <p className="text-[11px] text-muted-foreground">{stop.country} • {stop.arrive} → {stop.depart}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="itinerary" className="mt-4 space-y-3">
            {mockItinerary.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-4 shadow-card space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Day {day.day}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{day.title}</span>
                </div>
                <ul className="space-y-1">
                  {day.activities.map((a, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-accent" />
                      {a}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="memories" className="mt-4 space-y-3">
            <MemoryCard
              photo="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80"
              location="Amalfi Coast"
              date="Jun 18"
              caption="Stunning views from the cliffside 🇮🇹"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TripDetails;
