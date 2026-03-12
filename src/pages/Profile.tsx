import { Globe, Building2, Compass, Route, Award, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/shared/StatCard";
import EliMascot from "@/components/shared/EliMascot";

const badges = [
  { emoji: "🧭", name: "Explorer", desc: "Visited 5+ countries" },
  { emoji: "🌍", name: "World Traveler", desc: "10,000+ km traveled" },
  { emoji: "⛰️", name: "Adventurer", desc: "Completed 10 trips" },
];

const Profile = () => {
  return (
    <div className="px-5 pt-12 space-y-6 pb-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary">
          A
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Alex Traveler</h1>
          <p className="text-sm text-muted-foreground">Exploring the world 🌎</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2"
      >
        <StatCard icon={Globe} label="Countries" value={8} />
        <StatCard icon={Building2} label="Cities" value={23} />
        <StatCard icon={Compass} label="Trips" value={12} />
        <StatCard icon={Route} label="km" value="14k" />
      </motion.div>

      {/* Eli */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <EliMascot message="Great progress! 3 more countries to unlock Gold Explorer!" size="sm" />
      </motion.div>

      {/* Achievements */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" /> Achievements
        </h2>
        <div className="space-y-2">
          {badges.map((b) => (
            <div key={b.name} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
              <span className="text-2xl">{b.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
              <div className="bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">Earned</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-2"
      >
        {[
          { icon: Settings, label: "Settings" },
          { icon: LogOut, label: "Sign Out" },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full bg-card rounded-xl p-3 shadow-card flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
          >
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </motion.section>
    </div>
  );
};

export default Profile;
