import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, MapPin, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ShareMenu from "./ShareMenu";
import PostComments from "./PostComments";
import ReactionBar from "./ReactionBar";

interface CommunityPostCardProps {
  post: any;
  profile: any;
  index: number;
  onRefresh: () => void;
}

const postTypeColors: Record<string, string> = {
  experience: "bg-accent text-accent-foreground",
  sighting: "bg-primary/10 text-primary",
  tip: "bg-secondary text-secondary-foreground",
  question: "bg-muted text-muted-foreground",
};

const categoryIcons: Record<string, string> = {
  wildlife: "🦁",
  landmarks: "🏛️",
  food_culture: "🍜",
  general: "🌍",
};

const CommunityPostCard = ({ post, profile, index, onRefresh }: CommunityPostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwn = user?.id === post.user_id;

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const [likesRes, commentsRes, userLike, followRes] = await Promise.all([
        supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
        supabase.from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
        supabase.from("post_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle(),
        !isOwn ? supabase.from("user_follows").select("id").eq("follower_id", user.id).eq("following_id", post.user_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setLikeCount(likesRes.count || 0);
      setCommentCount(commentsRes.count || 0);
      setLiked(!!userLike.data);
      setIsFollowing(!!followRes.data);
    };
    fetchCounts();
  }, [post.id, user, isOwn, post.user_id]);

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const toggleFollow = async () => {
    if (!user || isOwn) return;
    if (isFollowing) {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", post.user_id);
      setIsFollowing(false);
      toast({ title: "Unfollowed" });
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: post.user_id });
      setIsFollowing(true);
      toast({ title: "Following!", description: `You're now following ${profile?.display_name || "this traveler"}.` });
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {(profile?.display_name || "?")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || "Traveler"}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo(post.created_at)}</p>
        </div>
        {!isOwn && (
          <Button
            size="sm"
            variant={isFollowing ? "secondary" : "outline"}
            className="h-7 text-[10px] rounded-lg gap-1 px-2"
            onClick={toggleFollow}
          >
            {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {/* Photo */}
      {post.photo_url && (
        <img src={post.photo_url} alt={post.title} className="w-full aspect-[4/3] object-cover" />
      )}

      {/* Content */}
      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-[10px] font-bold border-0 ${postTypeColors[post.post_type] || postTypeColors.experience}`}>
            {categoryIcons[post.category || "general"]} {post.post_type}
          </Badge>
          {post.location && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="h-3 w-3 text-accent" /> {post.location}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-foreground">{post.title}</h3>
        {post.body && <p className="text-xs text-muted-foreground leading-relaxed">{post.body}</p>}

        {/* Reactions */}
        <ReactionBar postId={post.id} />

        {/* Action Bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-border/50">
          <Button variant="ghost" size="sm" className={`h-8 gap-1.5 text-xs rounded-lg ${liked ? "text-red-500" : "text-muted-foreground"}`} onClick={toggleLike}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
            {likeCount > 0 && likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs rounded-lg text-muted-foreground" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="h-4 w-4" />
            {commentCount > 0 && commentCount}
          </Button>
          <div className="ml-auto">
            <ShareMenu title={post.title} text={`${post.title} - ${post.body || ""}`} />
          </div>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <PostComments postId={post.id} onCountChange={setCommentCount} />
      )}
    </motion.div>
  );
};

export default CommunityPostCard;
