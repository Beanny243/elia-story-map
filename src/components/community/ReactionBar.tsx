import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TRAVEL_EMOJIS = ["🔥", "😍", "🗺️", "📸", "🎒"];

interface ReactionBarProps {
  postId: string;
}

const ReactionBar = ({ postId }: ReactionBarProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, { count: number; reacted: boolean }>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("post_reactions").select("emoji, user_id").eq("post_id", postId);
      if (data) {
        const map: Record<string, { count: number; reacted: boolean }> = {};
        data.forEach((r) => {
          if (!map[r.emoji]) map[r.emoji] = { count: 0, reacted: false };
          map[r.emoji].count++;
          if (r.user_id === user?.id) map[r.emoji].reacted = true;
        });
        setReactions(map);
      }
    };
    fetch();
  }, [postId, user?.id]);

  const toggleReaction = async (emoji: string) => {
    if (!user) return;
    const current = reactions[emoji];
    if (current?.reacted) {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("emoji", emoji);
      setReactions((prev) => ({
        ...prev,
        [emoji]: { count: (prev[emoji]?.count || 1) - 1, reacted: false },
      }));
    } else {
      await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, emoji });
      setReactions((prev) => ({
        ...prev,
        [emoji]: { count: (prev[emoji]?.count || 0) + 1, reacted: true },
      }));
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TRAVEL_EMOJIS.map((emoji) => {
        const r = reactions[emoji];
        const isActive = r?.reacted;
        const count = r?.count || 0;
        return (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-all ${
              isActive ? "bg-accent/20 ring-1 ring-accent/40" : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && <span className="text-[10px] text-muted-foreground font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
