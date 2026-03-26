import { Globe, Building2, Compass, Route, Award, Settings, LogOut, ChevronRight, Crown, Camera } from "lucide-react";
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

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscriptionGate();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [tripCount, setTripCount] = useState(0);
  const [computedStats, setComputedStats] = useState({ countries: 0, cities: 0, km: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [profileRes, tripsRes, stopsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("trips").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("trip_stops").select("city, country, latitude, longitude, trip_id").in(
          "trip_id",
          (await supabase.from("trips").select("id").eq("user_id", user.id)).data?.map(t => t.id) || []
        ),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      setTripCount(tripsRes.count || 0);
      const stops = stopsRes.data || [];
      const uniqueCountries = new Set(stops.map(s => s.country).filter(Boolean));
      const uniqueCities = new Set(stops.map(s => `${s.city}-${s.country}`).filter(Boolean));
      let totalKm = 0;
      const tripStops: Record<string, typeof stops> = {};
      stops.forEach(s => { if (!tripStops[s.trip_id]) tripStops[s.trip_id] = []; tripStops[s.trip_id].push(s); });
      Object.values(tripStops).forEach(ts => {
        for (let i = 1; i < ts.length; i++) {
          const a = ts[i - 1], b = ts[i];
          if (a.latitude && a.longitude && b.latitude && b.longitude) totalKm += haversine(a.latitude, a.longitude, b.latitude, b.longitude);
        }
      });
      setComputedStats({ countries: uniqueCountries.size, cities: uniqueCities.size, km: Math.round(totalKm) });
      if (profileRes.data) {
        supabase.from("profiles").update({ countries_visited: uniqueCountries.size, cities_visited: uniqueCities.size, total_distance_km: Math.round(totalKm) }).eq("user_id", user.id).then(() => {});
      }
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  return (
    <div className="min-h-screen gradient-mesh">
      <motion.div initial="initial" animate="animate" variants={stagger} className="px-5 pt-12 space-y-6 pb-28">
        {/* Profile Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <div className="ring-gradient rounded-full">
            <div className="h-16 w-16 rounded-full bg-card flex items-center justify-center text-2xl font-display font-bold text-primary">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-display font-bold text-foreground">{profile?.display_name || "Traveler"}</h1>
              {isPremium && (
                <span className="inline-flex items-center gap-0.5 gradient-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glow">
                  <Crown className="h-3 w-3" /> PRO
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile?.bio || "Exploring the world 🌎"}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
          <StatCard icon={Globe} label="Countries" value={computedStats.countries} />
          <StatCard icon={Building2} label="Cities" value={computedStats.cities} />
          <StatCard icon={Compass} label="Trips" value={tripCount} />
          <StatCard icon={Route} label="km" value={computedStats.km >= 1000 ? `${Math.round(computedStats.km / 1000)}k` : computedStats.km} />
        </motion.div>

        {/* Mascot */}
        <motion.div variants={fadeUp}>
          <EliMascot message={tripCount > 0 ? "Great progress! Keep exploring!" : "Create your first trip to start earning badges!"} size="sm" />
        </motion.div>

        {/* Achievements */}
        <motion.section variants={fadeUp} className="space-y-3">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-accent flex items-center justify-center shadow-accent-glow">
              <Award className="h-3.5 w-3.5 text-white" />
            </div>
            Achievements
          </h2>
          <div className="space-y-2">
            {badges.map((b) => {
              const earned = b.check(profile, tripCount);
              return (
                <motion.div
                  key={b.name}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-2xl p-3.5 shadow-card border border-border/30 flex items-center gap-3"
                >
                  <div className={`text-2xl h-10 w-10 rounded-xl flex items-center justify-center ${earned ? 'bg-success/10' : 'bg-muted/60'}`}>
                    {b.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">{b.desc}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    earned
                      ? "gradient-primary text-white shadow-glow"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {earned ? "✓ Earned" : "Locked"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Upgrade CTA */}
        {!isPremium && (
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl gradient-hero p-5 shadow-glow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Unlock Premium</p>
                  <p className="text-xs text-white/70 mt-0.5">Unlimited trips, AI & map access</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/subscription")}
                  className="rounded-xl bg-white text-primary font-bold hover:bg-white/90 border-0 shadow-elevated"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu */}
        <motion.section variants={fadeUp} className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/settings")}
            className="w-full bg-card rounded-2xl p-4 shadow-card border border-border/30 flex items-center gap-3 text-left transition-all duration-300"
          >
            <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground flex-1">Settings</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full bg-card rounded-2xl p-4 shadow-card border border-border/30 flex items-center gap-3 text-left transition-all duration-300"
          >
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-semibold text-foreground flex-1">Sign Out</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Profile;
