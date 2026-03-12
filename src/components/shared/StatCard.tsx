import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, className }: StatCardProps) => (
  <div className={cn("bg-card rounded-2xl p-4 shadow-card flex flex-col items-center gap-1", className)}>
    <Icon className="h-5 w-5 text-accent" />
    <span className="text-xl font-bold font-display text-foreground">{value}</span>
    <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
  </div>
);

export default StatCard;
