import { Globe, Building2, Compass, Route, Award, Settings, LogOut, ChevronRight, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/shared/StatCard";
import EliMascot from "@/components/shared/EliMascot";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const badges = [
  { emoji: "🧭", name: "Explorer", desc: "Visited 5+ countries", check: (p: any) => (p?.countries_visited || 0) >= 5 },
  { emoji: "🌍", name: "World Traveler", desc: "10,000+ km traveled", check: (p: any) => (p?.total_distance_km || 0) >= 10000 },
  { emoji: "⛰️", name: "Adventurer", desc: "Completed 10 trips", check: (p: any, tripCount: number) => tripCount >= 10 },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscriptionGate();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [tripCount, setTripCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("trips").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([profileRes, tripsRes]) => {
      if (profileRes.data) setProfile(profileRes.data);
      setTripCount(tripsRes.count || 0);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="px-5 pt-12 space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary">
          {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">{profile?.display_name || "Traveler"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.bio || "Exploring the world 🌎"}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-2">
        <StatCard icon={Globe} label="Countries" value={profile?.countries_visited ?? 0} />
        <StatCard icon={Building2} label="Cities" value={profile?.cities_visited ?? 0} />
        <StatCard icon={Compass} label="Trips" value={tripCount} />
        <StatCard icon={Route} label="km" value={profile?.total_distance_km ? `${Math.round(profile.total_distance_km / 1000)}k` : "0"} />
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <EliMascot message={tripCount > 0 ? "Great progress! Keep exploring!" : "Create your first trip to start earning badges!"} size="sm" />
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" /> Achievements
        </h2>
        <div className="space-y-2">
          {badges.map((b) => {
            const earned = b.check(profile, tripCount);
            return (
              <div key={b.name} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
                <span className="text-2xl">{b.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${earned ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {earned ? "Earned" : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Unlock Premium</p>
              <p className="text-xs text-muted-foreground">Get unlimited trips, AI & map access</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/subscription")}
              className="rounded-xl gap-1.5"
            >
              <Crown className="h-3.5 w-3.5" /> Upgrade
            </Button>
          </div>
        </motion.div>
      )}

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
        <button onClick={() => navigate("/settings")} className="w-full bg-card rounded-xl p-3 shadow-card flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground flex-1">Settings</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={handleSignOut}
          className="w-full bg-card rounded-xl p-3 shadow-card flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground flex-1">Sign Out</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </motion.section>
    </div>
  );
};

export default Profile;
