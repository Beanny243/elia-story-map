import { MapPin, Calendar, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemoryCardProps {
  photo: string;
  location: string;
  date: string;
  caption: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onPhotoClick?: () => void;
}

const MemoryCard = ({ photo, location, date, caption, onEdit, onDelete, onPhotoClick }: MemoryCardProps) => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/40 group relative hover:shadow-elevated transition-all duration-300">
    <div className="h-48 overflow-hidden cursor-pointer" onClick={onPhotoClick}>
      <img src={photo} alt={caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full glass shadow-sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full glass shadow-sm text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
    <div className="p-3.5 space-y-2">
      <p className="text-sm font-semibold text-foreground leading-snug">{caption}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-accent" />{location}</span>
        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{date}</span>
      </div>
    </div>
  </div>
);

export default MemoryCard;
