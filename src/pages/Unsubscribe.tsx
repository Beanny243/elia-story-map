import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MailX, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
          headers: { apikey: anonKey },
        });
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setStatus("already"); return; }
        setStatus("valid");
      } catch { setStatus("error"); }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Validating...</p>
          </>
        )}
        {status === "valid" && (
          <>
            <MailX className="h-14 w-14 mx-auto text-destructive" />
            <h1 className="text-2xl font-display font-bold text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground text-sm">Are you sure you want to unsubscribe from Eliamap emails?</p>
            <Button onClick={handleUnsubscribe} disabled={processing} variant="destructive" className="w-full rounded-2xl h-12">
              {processing ? "Processing..." : "Confirm Unsubscribe"}
            </Button>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 mx-auto text-green-500" />
            <h1 className="text-2xl font-display font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You've been unsubscribed from Eliamap emails.</p>
          </>
        )}
        {status === "already" && (
          <>
            <CheckCircle2 className="h-14 w-14 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You've already unsubscribed from these emails.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <AlertCircle className="h-14 w-14 mx-auto text-destructive" />
            <h1 className="text-2xl font-display font-bold text-foreground">Invalid Link</h1>
            <p className="text-muted-foreground text-sm">This unsubscribe link is invalid or has expired.</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-14 w-14 mx-auto text-destructive" />
            <h1 className="text-2xl font-display font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">Please try again later.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
