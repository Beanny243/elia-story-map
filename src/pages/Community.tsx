import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import CreatePostSheet from "@/components/community/CreatePostSheet";

const FILTERS = [
  { value: "all", label: "All", icon: "🌍" },
  { value: "experience", label: "Experiences", icon: "✈️" },
  { value: "sighting", label: "Sightings", icon: "👀" },
  { value: "tip", label: "Tips", icon: "💡" },
  { value: "question", label: "Questions", icon: "❓" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "wildlife", label: "🦁 Wildlife" },
  { value: "landmarks", label: "🏛️ Landmarks" },
  { value: "food_culture", label: "🍜 Food" },
];

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50);
    if (typeFilter !== "all") query = query.eq("post_type", typeFilter);
    if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
    const { data } = await query;
    if (data) {
      setPosts(data);
      const userIds = [...new Set(data.map((p) => p.user_id))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
        if (profs) {
          const map: Record<string, any> = {};
          profs.forEach((p) => { map[p.user_id] = p; });
          setProfiles(map);
        }
      }
    }
    setLoading(false);
  }, [typeFilter, categoryFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return (
    <div className="min-h-screen gradient-mesh pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Community</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Share stories, spot wildlife, and connect with travelers</p>
        </motion.div>
      </div>

      {/* Type Filters */}
      <div className="px-5 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <motion.div key={f.value} whileTap={{ scale: 0.93 }}>
            <Badge
              onClick={() => setTypeFilter(f.value)}
              className={`cursor-pointer whitespace-nowrap text-[11px] px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                typeFilter === f.value
                  ? "gradient-accent text-white border-transparent shadow-accent-glow"
                  : "bg-card text-muted-foreground border-border/30 shadow-card"
              }`}
            >
              {f.icon} {f.label}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="px-5 pb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {CATEGORY_FILTERS.map((f) => (
          <Badge
            key={f.value}
            onClick={() => setCategoryFilter(f.value)}
            className={`cursor-pointer whitespace-nowrap text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-300 ${
              categoryFilter === f.value
                ? "gradient-primary text-white border-transparent"
                : "bg-card/60 text-muted-foreground border-border/20"
            }`}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      <div className="px-5 space-y-4">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-8 h-8 mx-auto rounded-full border-2 border-primary/20 border-t-primary"
            />
            <p className="text-xs text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-4">
            <p className="text-5xl">🌍</p>
            <div>
              <p className="text-sm font-semibold text-foreground">No posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to share your story!</p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="rounded-2xl gap-2 gradient-accent text-white border-0 shadow-accent-glow font-bold">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {posts.map((post, i) => (
              <CommunityPostCard key={post.id} post={post} profile={profiles[post.user_id]} index={i} onRefresh={fetchPosts} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.85 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-2xl gradient-accent text-white shadow-accent-glow flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <CreatePostSheet open={showCreate} onOpenChange={setShowCreate} onCreated={fetchPosts} />
    </div>
  );
};

export default Community;
