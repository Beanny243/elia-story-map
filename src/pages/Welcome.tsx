import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/eliamap-logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6"
      >
        <img src={logo} alt="Eliamap" className="h-36 w-36 mx-auto drop-shadow-lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-2 mb-10"
      >
        <h1 className="text-4xl font-display font-bold text-foreground">Eliamap</h1>
        <p className="text-muted-foreground text-sm italic">Every journey becomes a story.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-xs space-y-3"
      >
        <Button
          onClick={() => navigate("/onboarding")}
          className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-bold"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Button>
        <button
          onClick={() => navigate("/auth")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Already have an account? <span className="text-accent font-semibold">Sign In</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Welcome;
