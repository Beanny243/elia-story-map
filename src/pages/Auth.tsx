import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import EliMascot from "@/components/shared/EliMascot";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Inbox } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const hasOnboardingAnswers = !!localStorage.getItem("onboarding_answers");

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

        if (data.user && !data.session) {
          setShowVerifyScreen(true);
        }

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await saveOnboardingAnswers(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (showVerifyScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center"
          >
            <Inbox className="h-10 w-10 text-accent" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Check your inbox! 📬
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a verification link to
            </p>
            <p className="text-foreground font-semibold text-sm bg-muted/50 rounded-xl py-2 px-4 inline-block">
              {email}
            </p>
          </div>

          <EliMascot
            message="Tap the link in your email to start your adventure! 🌍"
            size="sm"
          />

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-left bg-card rounded-2xl p-4 border border-border/40">
              <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Open the email from Eliamap</p>
                <p className="text-xs text-muted-foreground mt-0.5">It may take a minute to arrive</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left bg-card rounded-2xl p-4 border border-border/40">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Tap the verification link</p>
                <p className="text-xs text-muted-foreground mt-0.5">You'll be redirected back to the app</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left bg-card rounded-2xl p-4 border border-border/40">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Start exploring!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your adventure awaits ✈️</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Didn't get the email? Check your spam folder
            </p>
            <Button
              variant="outline"
              className="rounded-xl w-full"
              onClick={() => setShowVerifyScreen(false)}
            >
              ← Back to sign in
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
