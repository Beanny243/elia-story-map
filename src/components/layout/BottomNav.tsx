import { Home, Map, Compass, Users, User, Crown, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/trips", icon: Compass, label: "Trips" },
  { path: "/memories", icon: Camera, label: "Memories" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/map", icon: Map, label: "Map", premium: true },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useSubscriptionGate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-area-bottom">
      <div className="mx-auto max-w-lg flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const showBadge = tab.premium && !isPremium;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-90"
              )}
            >
              <div className="relative flex items-center justify-center h-8 w-8">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 gradient-primary rounded-xl opacity-15"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon className={cn(
                  "h-[18px] w-[18px] relative z-10 transition-all duration-300",
                  isActive && "stroke-[2.5] scale-110"
                )} />
                {showBadge && (
                  <Crown className="absolute -top-1 -right-1.5 h-3 w-3 text-accent fill-accent" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-all duration-300",
                isActive ? "text-primary font-bold" : ""
              )}>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
