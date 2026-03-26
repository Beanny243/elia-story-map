import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import EliMascot from "@/components/shared/EliMascot";
import { Mail, Lock, User, ArrowRight, MailCheck, ExternalLink } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if coming from onboarding (has answers stored)
  const hasOnboardingAnswers = !!localStorage.getItem("onboarding_answers");

  // If user came from onboarding, default to signup
  useEffect(() => {
    if (hasOnboardingAnswers) {
      setIsLogin(false);
    }
  }, [hasOnboardingAnswers]);

  const saveOnboardingAnswers = async (userId: string) => {
    const raw = localStorage.getItem("onboarding_answers");
    if (!raw) return;
    try {
      const answers = JSON.parse(raw);
      if (Object.keys(answers).length === 0) return;
      await supabase.from("profiles").update({
        travel_style: answers.travel_style || null,
        trip_frequency: answers.trip_frequency || null,
        interests: answers.interests || [],
        onboarding_completed: true,
      }).eq("user_id", userId);
    } catch {} finally {
      localStorage.removeItem("onboarding_answers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: "https://elia-story-map.lovable.app",
          },
        });
        if (error) throw error;

        // If auto-confirm is off, user needs to verify email
        if (data.user && !data.session) {
          setShowVerifyScreen(true);
        }

        // If session exists (auto-confirm on), save answers immediately
        if (data.user && data.session) {
          await saveOnboardingAnswers(data.user.id);
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state to save onboarding answers on email verification login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await saveOnboardingAnswers(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Eliamap</h1>
          <p className="text-sm text-muted-foreground italic">Every journey becomes a story.</p>
        </div>

        <EliMascot
          message={isLogin ? "Welcome back, explorer!" : "Let's create your account!"}
          size="sm"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Display Name
              </Label>
              <Input
                placeholder="Your explorer name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-xl bg-card"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-xl bg-card"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-bold"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
