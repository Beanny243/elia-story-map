import { MapPin, Calendar, Navigation, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-accent text-accent-foreground" },
  completed: { label: "Completed", className: "bg-primary text-primary-foreground" },
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
    <div className="relative group">
      <button
        onClick={() => navigate(`/trips/${id}`)}
        className="w-full bg-card rounded-2xl overflow-hidden shadow-card border border-border/40 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 text-left"
      >
        <div className="h-40 relative overflow-hidden">
          <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {status && statusConfig[status] && (
            <Badge className={`absolute top-3 left-3 text-[10px] font-bold border-0 shadow-sm ${statusConfig[status].className}`}>
              {statusConfig[status].label}
            </Badge>
          )}
          <div className="absolute bottom-3 left-3.5 right-3.5">
            <h3 className="text-white font-display font-bold text-lg leading-tight drop-shadow-sm">{title}</h3>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5 text-accent" />{destination}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{startDate} – {endDate}</span>
          <span className="flex items-center gap-1.5 ml-auto"><Navigation className="h-3.5 w-3.5" />{stops}</span>
        </div>
      </button>
      {(onEdit || onDelete) && (
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-xl glass shadow-sm hover:bg-card transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-xl glass shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TripCard;
