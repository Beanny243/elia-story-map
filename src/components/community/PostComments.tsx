import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PostCommentsProps {
  postId: string;
  onCountChange: (count: number) => void;
}

const PostComments = ({ postId, onCountChange }: PostCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at");
      if (data) {
        setComments(data);
        onCountChange(data.length);
        // Fetch profiles for commenters
        const userIds = [...new Set(data.map((c) => c.user_id))];
        if (userIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
          if (profs) {
            const map: Record<string, any> = {};
            profs.forEach((p) => { map[p.user_id] = p; });
            setProfiles(map);
          }
        }
      }
    };
    fetchComments();
  }, [postId, onCountChange]);

  const handleSend = async () => {
    if (!newComment.trim() || !user || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, user_id: user.id, body: newComment.trim() })
      .select()
      .single();
    setSending(false);
    if (data) {
      setComments((prev) => [...prev, data]);
      onCountChange(comments.length + 1);
      setNewComment("");
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="border-t border-border/50 p-3 pt-2 space-y-2">
      {comments.map((c) => {
        const prof = profiles[c.user_id];
        return (
          <div key={c.id} className="flex gap-2">
            <Avatar className="h-6 w-6 mt-0.5">
              <AvatarFallback className="bg-secondary text-[9px] font-bold">
                {(prof?.display_name || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]">
                <span className="font-semibold text-foreground">{prof?.display_name || "Traveler"}</span>{" "}
                <span className="text-muted-foreground">{c.body}</span>
              </p>
              <p className="text-[9px] text-muted-foreground/60">{timeAgo(c.created_at)}</p>
            </div>
          </div>
        );
      })}
      <div className="flex gap-2 pt-1">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Add a comment..."
          className="h-8 text-xs rounded-lg bg-secondary/50"
        />
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={handleSend} disabled={!newComment.trim() || sending}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PostComments;
