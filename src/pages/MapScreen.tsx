import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

const MapScreen = () => {
  return (
    <div className="relative h-screen">
      {/* Map placeholder - will be replaced with Mapbox */}
      <div className="absolute inset-0 bg-secondary">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=60")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.7) brightness(1.05)",
          }}
        />

        {/* Overlay pins */}
        <div className="absolute inset-0">
          {[
            { top: "25%", left: "45%", label: "Paris" },
            { top: "35%", left: "55%", label: "Rome" },
            { top: "30%", left: "68%", label: "Tokyo" },
            { top: "50%", left: "25%", label: "NYC" },
            { top: "60%", left: "42%", label: "Cairo" },
          ].map((pin) => (
            <motion.div
              key={pin.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + Math.random() * 0.5, type: "spring" }}
              className="absolute flex flex-col items-center"
              style={{ top: pin.top, left: pin.left }}
            >
              <div className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 shadow-elevated">
                {pin.label}
              </div>
              <MapPin className="h-5 w-5 text-accent drop-shadow-lg" fill="hsl(18 100% 62%)" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-12 left-5 right-5"
      >
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-elevated flex items-center gap-3">
          <Navigation className="h-5 w-5 text-accent" />
          <div>
            <h2 className="font-display font-bold text-sm text-foreground">Your Travel Map</h2>
            <p className="text-[11px] text-muted-foreground">5 cities • 4 countries visited</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom info card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-24 left-5 right-5"
      >
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl p-4 shadow-elevated">
          <p className="text-xs text-muted-foreground mb-2">Connect Mapbox to unlock the interactive map with real-time route tracking and location pins.</p>
          <div className="flex gap-2 text-xs">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">🗺 Routes</span>
            <span className="bg-accent/10 text-accent px-2 py-1 rounded-lg font-medium">📍 Pins</span>
            <span className="bg-success/10 text-success px-2 py-1 rounded-lg font-medium">✈️ Tracking</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MapScreen;
