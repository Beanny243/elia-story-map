import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import EliMascot from "@/components/shared/EliMascot";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasOnboardingAnswers = !!localStorage.getItem("onboarding_answers");

  useEffect(() => { if (hasOnboardingAnswers) setIsLogin(false); }, [hasOnboardingAnswers]);

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
    } catch {} finally { localStorage.removeItem("onboarding_answers"); }
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
          email, password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        if (data.user) {
          await saveOnboardingAnswers(data.user.id);
          toast({ title: "Welcome to Eliamap! 🌍", description: "Your account has been created successfully." });
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) await saveOnboardingAnswers(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);



  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="text-4xl font-display font-bold text-gradient tracking-tight"
          >
            Eliamap
          </motion.h1>
          <p className="text-sm text-muted-foreground italic">Every journey becomes a story.</p>
        </div>

        <EliMascot message={isLogin ? "Welcome back, explorer!" : "Let's create your account!"} size="sm" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Display Name
              </Label>
              <Input placeholder="Your explorer name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-2xl bg-card border-border/30 h-12 shadow-card focus-visible:shadow-glow focus-visible:ring-primary/20" />
            </motion.div>
          )}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="rounded-2xl bg-card border-border/30 h-12 shadow-card focus-visible:shadow-glow focus-visible:ring-primary/20" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="rounded-2xl bg-card border-border/30 h-12 shadow-card focus-visible:shadow-glow focus-visible:ring-primary/20" />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl gap-2 gradient-accent text-white h-13 font-bold text-base shadow-accent-glow border-0 transition-all duration-300 hover:opacity-90"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-accent font-bold hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
