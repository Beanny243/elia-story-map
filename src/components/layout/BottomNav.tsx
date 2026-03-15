import { Home, Map, Compass, Users, User, Crown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/trips", icon: Compass, label: "Trips" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/map", icon: Map, label: "Map", premium: true },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useSubscriptionGate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
      <div className="mx-auto max-w-lg flex items-center justify-around px-2 py-2">
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
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {showBadge && (
                  <Crown className="absolute -top-1.5 -right-2 h-3 w-3 text-primary fill-primary" />
                )}
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
