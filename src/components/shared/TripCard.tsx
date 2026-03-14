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
        className="w-full bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 text-left"
      >
        <div className="h-36 relative overflow-hidden">
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          {status && statusConfig[status] && (
            <Badge className={`absolute top-2.5 left-2.5 text-[10px] font-bold border-0 ${statusConfig[status].className}`}>
              {statusConfig[status].label}
            </Badge>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-primary-foreground font-display font-bold text-lg leading-tight">{title}</h3>
          </div>
        </div>
        <div className="p-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-accent" />{destination}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{startDate}</span>
          <span className="flex items-center gap-1 ml-auto"><Navigation className="h-3.5 w-3.5" />{stops} stops</span>
        </div>
      </button>
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-xl bg-card/90 backdrop-blur-sm shadow-sm hover:bg-card transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-xl bg-card/90 backdrop-blur-sm shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
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
