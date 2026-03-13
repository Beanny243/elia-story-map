import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TripInfo {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
  color: string;
  stopCount: number;
}

interface TripInfoCardProps {
  trip: TripInfo | null;
  onClose: () => void;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

const TripInfoCard = ({ trip, onClose }: TripInfoCardProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {trip && (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="absolute bottom-28 left-5 right-5 z-20"
        >
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated overflow-hidden">
            {/* Color accent bar */}
            <div className="h-1" style={{ background: trip.color }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base text-foreground truncate">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-accent shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {trip.destination}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: trip.color }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {trip.stopCount} {trip.stopCount === 1 ? "stop" : "stops"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-accent-foreground transition-colors"
                style={{ background: trip.color }}
              >
                View Trip Details
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TripInfoCard;
