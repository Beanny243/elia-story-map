import { MapPin, Calendar, Navigation, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted/90 text-muted-foreground backdrop-blur-sm" },
  active: { label: "Active", className: "gradient-accent text-white shadow-accent-glow" },
  completed: { label: "Completed", className: "gradient-primary text-white" },
};

interface TripCardProps {
  id: string;
  title: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  stops: number;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TripCard = ({ id, title, destination, coverImage, startDate, endDate, stops, status, onEdit, onDelete }: TripCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="relative group">
      <button
        onClick={() => navigate(`/trips/${id}`)}
        className="w-full bg-card rounded-2xl overflow-hidden shadow-card border border-border/30 hover:shadow-elevated transition-all duration-400 text-left"
      >
        <div className="h-44 relative overflow-hidden">
          <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
          {status && statusConfig[status] && (
            <Badge className={`absolute top-3 left-3 text-[10px] font-bold border-0 ${statusConfig[status].className}`}>
              {statusConfig[status].label}
            </Badge>
          )}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-lg">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="h-3 w-3 text-accent" />
              <span className="text-white/80 text-xs font-medium">{destination}</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-3.5 w-3.5 text-primary/60" />{startDate} – {endDate}</span>
          <span className="flex items-center gap-1.5 ml-auto font-semibold text-foreground/70"><Navigation className="h-3.5 w-3.5 text-accent/60" />{stops} stops</span>
        </div>
      </button>
      {(onEdit || onDelete) && (
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-xl glass shadow-sm hover:bg-card transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-xl glass shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TripCard;
