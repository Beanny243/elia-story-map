import { motion, AnimatePresence } from "framer-motion";
import { Filter, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TripFilterItem {
  id: string;
  title: string;
  color: string;
  stopCount: number;
}

interface TripFilterPanelProps {
  trips: TripFilterItem[];
  visibleTripIds: Set<string>;
  onToggleTrip: (tripId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const TripFilterPanel = ({ trips, visibleTripIds, onToggleTrip, onShowAll, onHideAll }: TripFilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const allVisible = trips.length > 0 && visibleTripIds.size === trips.length;
  const noneVisible = visibleTripIds.size === 0;

  if (trips.length < 2) return null;

  return (
    <div className="absolute top-28 left-5 right-5 z-10">
      {/* Toggle button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => setIsOpen((o) => !o)}
        className="bg-card/90 backdrop-blur-lg rounded-xl px-3 py-2 shadow-elevated flex items-center gap-2"
      >
        <Filter className="h-3.5 w-3.5 text-accent" />
        <span className="text-xs font-semibold text-foreground">
          Filter Trips
        </span>
        <span className="text-[10px] text-muted-foreground ml-1">
          {visibleTripIds.size}/{trips.length}
        </span>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="mt-2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated p-3 space-y-2 max-h-60 overflow-y-auto"
          >
            {/* Quick actions */}
            <div className="flex gap-2 pb-2 border-b border-border/50">
              <button
                onClick={onShowAll}
                disabled={allVisible}
                className="flex items-center gap-1 text-[10px] font-semibold text-accent disabled:opacity-40 transition-opacity"
              >
                <Eye className="h-3 w-3" /> Show All
              </button>
              <button
                onClick={onHideAll}
                disabled={noneVisible}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground disabled:opacity-40 transition-opacity"
              >
                <EyeOff className="h-3 w-3" /> Hide All
              </button>
            </div>

            {/* Trip list */}
            {trips.map((trip) => {
              const isVisible = visibleTripIds.has(trip.id);
              return (
                <button
                  key={trip.id}
                  onClick={() => onToggleTrip(trip.id)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all hover:bg-secondary/50"
                >
                  {/* Color dot + checkbox feel */}
                  <div
                    className="h-3 w-3 rounded-full shrink-0 border-2 transition-all"
                    style={{
                      background: isVisible ? trip.color : "transparent",
                      borderColor: trip.color,
                      opacity: isVisible ? 1 : 0.4,
                    }}
                  />
                  <span
                    className="text-xs font-medium text-left flex-1 truncate transition-opacity"
                    style={{ opacity: isVisible ? 1 : 0.4 }}
                  >
                    {trip.title}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground transition-opacity"
                    style={{ opacity: isVisible ? 0.7 : 0.3 }}
                  >
                    {trip.stopCount} stops
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripFilterPanel;
