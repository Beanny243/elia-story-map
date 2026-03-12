import { Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MemoryCard from "@/components/shared/MemoryCard";

const mockMemories = [
  {
    photo: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    location: "Paris, France",
    date: "Apr 15, 2025",
    caption: "Golden hour at the Eiffel Tower ✨",
  },
  {
    photo: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80",
    location: "Amalfi Coast, Italy",
    date: "Jun 18, 2025",
    caption: "The colors of the Italian coast are unreal 🇮🇹",
  },
  {
    photo: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
    location: "Kyoto, Japan",
    date: "Mar 5, 2025",
    caption: "Peaceful morning at the bamboo grove 🎋",
  },
  {
    photo: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80",
    location: "Santorini, Greece",
    date: "Aug 10, 2025",
    caption: "Blue domes and dreamy sunsets 💙",
  },
];

const Memories = () => {
  return (
    <div className="px-5 pt-12 space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Memories</h1>
        <p className="text-sm text-muted-foreground">Your travel timeline</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Button className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Upload className="h-4 w-4" /> Add Memory
        </Button>
      </motion.div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4 pb-4">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-border" />

        {mockMemories.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-accent border-2 border-background z-10" />
            <MemoryCard {...m} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Memories;
