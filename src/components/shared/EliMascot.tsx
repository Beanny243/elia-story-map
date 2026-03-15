import eliImg from "@/assets/eli-mascot.png";
import { cn } from "@/lib/utils";

interface EliMascotProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const sizes = { sm: "h-12 w-12", md: "h-20 w-20", lg: "h-28 w-28" };

const EliMascot = ({ message, size = "md", className, animate = true }: EliMascotProps) => (
  <div className={cn("flex items-end gap-3", className)}>
    <img
      src={eliImg}
      alt="Eli the Explorer"
      className={cn(sizes[size], "object-contain drop-shadow-md", animate && "animate-float")}
    />
    {message && (
      <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-card border border-border/40 max-w-[220px]">
        <p className="text-sm text-foreground font-medium leading-relaxed">{message}</p>
      </div>
    )}
  </div>
);

export default EliMascot;
