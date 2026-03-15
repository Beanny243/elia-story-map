import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
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
      // Fetch profiles
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

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-display font-bold text-foreground">
          Community
        </motion.h1>
        <p className="text-sm text-muted-foreground">Share stories, spot wildlife, and connect with travelers</p>
      </div>

      {/* Type Filters */}
      <div className="px-5 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <Badge
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`cursor-pointer whitespace-nowrap text-[11px] px-2.5 py-1 rounded-lg border-0 transition-all ${
              typeFilter === f.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.icon} {f.label}
          </Badge>
        ))}
      </div>

      {/* Category Filters */}
      <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {CATEGORY_FILTERS.map((f) => (
          <Badge
            key={f.value}
            onClick={() => setCategoryFilter(f.value)}
            className={`cursor-pointer whitespace-nowrap text-[10px] px-2 py-0.5 rounded-md border-0 transition-all ${
              categoryFilter === f.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      <div className="px-5 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">🌍</p>
            <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
            <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          </div>
        ) : (
          posts.map((post, i) => (
            <CommunityPostCard key={post.id} post={post} profile={profiles[post.user_id]} index={i} onRefresh={fetchPosts} />
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 z-40 h-12 w-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </motion.button>

      <CreatePostSheet open={showCreate} onOpenChange={setShowCreate} onCreated={fetchPosts} />
    </div>
  );
};

export default Community;
