import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import EliMascot from "@/components/shared/EliMascot";
import { ArrowRight, ArrowLeft, Check, Plane, Backpack, Palmtree, Mountain, Building2, Utensils, Camera, Music, Book, Heart, Globe, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StepOption {
  label: string;
  value: string;
  icon: React.ReactNode;
  emoji?: string;
}

const STEPS = [
  {
    id: "travel_style",
    title: "How do you love to travel?",
    subtitle: "Pick the style that fits you best",
    mascotMessage: "Let's find your travel vibe! 🌍",
    multiSelect: false,
    options: [
      { label: "Backpacker", value: "backpacker", icon: <Backpack className="h-6 w-6" />, emoji: "🎒" },
      { label: "Luxury", value: "luxury", icon: <Palmtree className="h-6 w-6" />, emoji: "✨" },
      { label: "Adventure", value: "adventure", icon: <Mountain className="h-6 w-6" />, emoji: "🧗" },
      { label: "Cultural", value: "cultural", icon: <Building2 className="h-6 w-6" />, emoji: "🏛️" },
      { label: "Relaxation", value: "relaxation", icon: <Palmtree className="h-6 w-6" />, emoji: "🏖️" },
      { label: "Road Trip", value: "road_trip", icon: <MapPin className="h-6 w-6" />, emoji: "🚗" },
    ],
  },
  {
    id: "trip_frequency",
    title: "How often do you travel?",
    subtitle: "No judgment — every pace is perfect!",
    mascotMessage: "Tell me about your travel rhythm! ✈️",
    multiSelect: false,
    options: [
      { label: "Once a year", value: "yearly", icon: <Globe className="h-6 w-6" />, emoji: "📅" },
      { label: "2-3 trips/year", value: "few_times", icon: <Plane className="h-6 w-6" />, emoji: "🗺️" },
      { label: "Monthly explorer", value: "monthly", icon: <MapPin className="h-6 w-6" />, emoji: "🌟" },
      { label: "Digital nomad", value: "nomad", icon: <Globe className="h-6 w-6" />, emoji: "💻" },
    ],
  },
  {
    id: "interests",
    title: "What excites you most?",
    subtitle: "Pick as many as you like!",
    mascotMessage: "Almost there! What makes your trips special? 🎉",
    multiSelect: true,
    options: [
      { label: "Food & Drink", value: "food", icon: <Utensils className="h-6 w-6" />, emoji: "🍜" },
      { label: "Photography", value: "photography", icon: <Camera className="h-6 w-6" />, emoji: "📸" },
      { label: "Nightlife", value: "nightlife", icon: <Music className="h-6 w-6" />, emoji: "🎶" },
      { label: "History", value: "history", icon: <Book className="h-6 w-6" />, emoji: "📚" },
      { label: "Nature", value: "nature", icon: <Mountain className="h-6 w-6" />, emoji: "🌿" },
      { label: "Romance", value: "romance", icon: <Heart className="h-6 w-6" />, emoji: "💕" },
    ],
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const currentAnswer = answers[step.id];
  const hasAnswer = step.multiSelect
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : !!currentAnswer;

  const handleSelect = (value: string) => {
    if (step.multiSelect) {
      const current = (answers[step.id] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [step.id]: updated });
    } else {
      setAnswers({ ...answers, [step.id]: value });
    }
  };

  const isSelected = (value: string) => {
    if (step.multiSelect) {
      return ((answers[step.id] as string[]) || []).includes(value);
    }
    return answers[step.id] === value;
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            travel_style: answers.travel_style as string,
            trip_frequency: answers.trip_frequency as string,
            interests: answers.interests as string[],
            onboarding_completed: true,
          })
          .eq("user_id", user!.id);

        if (error) throw error;
        navigate("/", { replace: true });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user!.id);
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-8 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button onClick={handleBack} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <span className="text-xs font-semibold text-muted-foreground">
            {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
          Skip
        </button>
      </div>

      <Progress value={progress} className="h-1.5 mb-6 rounded-full" />

      {/* Mascot */}
      <motion.div
        key={`mascot-${currentStep}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <EliMascot message={step.mascotMessage} size="sm" />
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-display font-bold text-foreground">{step.title}</h2>
            <p className="text-sm text-muted-foreground">{step.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {step.options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(option.value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selected
                      ? "border-accent bg-accent/10 shadow-md"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-accent-foreground" />
                    </motion.div>
                  )}
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-sm font-semibold ${selected ? "text-accent" : "text-foreground"}`}>
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Continue button */}
      <div className="mt-6 pt-4">
        <Button
          onClick={handleNext}
          disabled={!hasAnswer || saving}
          className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-bold disabled:opacity-40"
        >
          {saving ? "Saving..." : currentStep === STEPS.length - 1 ? "Let's Go!" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
