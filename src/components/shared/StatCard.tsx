import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, className }: StatCardProps) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    className={cn(
      "bg-card rounded-2xl p-3 shadow-card border border-border/30 flex flex-col items-center gap-1 transition-all duration-300 hover:shadow-glow",
      className
    )}
  >
    <div className="h-8 w-8 rounded-xl gradient-accent flex items-center justify-center shadow-accent-glow">
      <Icon className="h-3.5 w-3.5 text-white" />
    </div>
    <span className="text-lg font-bold font-display text-foreground tracking-tight">{value}</span>
    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{label}</span>
  </motion.div>
);

export default StatCard;
