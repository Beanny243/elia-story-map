import { Home, Map, Compass, Users, User, Crown, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto max-w-lg flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const showBadge = tab.premium && !isPremium;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <tab.icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.5]")} />
                {showBadge && (
                  <Crown className="absolute -top-1 -right-1.5 h-3 w-3 text-accent fill-accent" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-colors",
                isActive && "text-primary"
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
