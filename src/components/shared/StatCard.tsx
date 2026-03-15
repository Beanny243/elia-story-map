import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, className }: StatCardProps) => (
  <div className={cn(
    "bg-card rounded-2xl p-3.5 shadow-card border border-border/40 flex flex-col items-center gap-1.5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5",
    className
  )}>
    <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center">
      <Icon className="h-4 w-4 text-accent" />
    </div>
    <span className="text-lg font-bold font-display text-foreground tracking-tight">{value}</span>
    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
  </div>
);

export default StatCard;
