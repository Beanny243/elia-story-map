import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MemoryCard from "@/components/shared/MemoryCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Memories = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("memory_date", { ascending: false })
      .then(({ data }) => {
        if (data) setMemories(data);
      });
  }, [user]);

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

      {memories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No memories yet. Start capturing your adventures!</p>
      ) : (
        <div className="relative pl-6 space-y-4 pb-4">
          <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-border" />
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-accent border-2 border-background z-10" />
              <MemoryCard
                photo={m.photo_url || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                location={m.location || "Unknown"}
                date={m.memory_date ? new Date(m.memory_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                caption={m.caption || ""}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Memories;
