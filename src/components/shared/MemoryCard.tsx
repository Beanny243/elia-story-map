import { MapPin, Calendar } from "lucide-react";

interface MemoryCardProps {
  photo: string;
  location: string;
  date: string;
  caption: string;
}

const MemoryCard = ({ photo, location, date, caption }: MemoryCardProps) => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card">
    <div className="h-48 overflow-hidden">
      <img src={photo} alt={caption} className="w-full h-full object-cover" />
    </div>
    <div className="p-3 space-y-1.5">
      <p className="text-sm font-medium text-foreground leading-snug">{caption}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" />{location}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{date}</span>
      </div>
    </div>
  </div>
);

export default MemoryCard;
