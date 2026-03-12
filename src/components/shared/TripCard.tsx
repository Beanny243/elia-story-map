import { MapPin, Calendar, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TripCardProps {
  id: string;
  title: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  stops: number;
}

const TripCard = ({ id, title, destination, coverImage, startDate, endDate, stops }: TripCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/trips/${id}`)}
      className="w-full bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 text-left"
    >
      <div className="h-36 relative overflow-hidden">
        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
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
  );
};

export default TripCard;
