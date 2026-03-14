import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  className?: string;
}

const UpgradePrompt = ({ feature, description, className = "" }: UpgradePromptProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-display font-bold text-foreground mb-1">
        {feature}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        {description || "Upgrade to a premium plan to unlock this feature."}
      </p>
      <Button
        onClick={() => navigate("/subscription")}
        className="rounded-xl gap-2 bg-primary text-primary-foreground px-6"
      >
        <Crown className="h-4 w-4" /> Upgrade Now
      </Button>
    </motion.div>
  );
};

export default UpgradePrompt;
