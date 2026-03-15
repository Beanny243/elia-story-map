import { Sparkles, Loader2, Save, RotateCcw, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

type ItineraryDay = { day_number: number; title: string; activities: string[] };

interface InlineItineraryGeneratorProps {
  trip: {
    id: string;
    destination: string;
    start_date?: string | null;
    end_date?: string | null;
    travel_style?: string | null;
    budget?: string | null;
    companions?: string | null;
  };
  onSaved: (items: ItineraryDay[]) => void;
}

const InlineItineraryGenerator = ({ trip, onSaved }: InlineItineraryGeneratorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUseAI } = useSubscriptionGate();

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setStreamText("");
    setItinerary([]);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-itinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            destination: trip.destination,
            startDate: trip.start_date,
            endDate: trip.end_date,
            travelStyle: trip.travel_style,
            budget: trip.budget,
            companions: trip.companions,
            prompt,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to generate");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setStreamText(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      const cleaned = fullText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ItineraryDay[];
        setItinerary(parsed);
      } else {
        throw new Error("Could not parse itinerary from AI response");
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }, [trip, prompt, toast]);

  const handleSave = async () => {
    if (itinerary.length === 0) return;
    setSaving(true);

    await supabase.from("itinerary_items").delete().eq("trip_id", trip.id);

    const items = itinerary.map((day) => ({
      trip_id: trip.id,
      day_number: day.day_number,
      title: day.title,
      activities: day.activities,
    }));

    const { error } = await supabase.from("itinerary_items").insert(items);
    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Itinerary saved!", description: `${itinerary.length} days saved.` });
      onSaved(itinerary);
      setShowForm(false);
      setItinerary([]);
      setStreamText("");
      setPrompt("");
    }
  };

  // Not premium — show upgrade button
  if (!canUseAI) {
    return (
      <Button
        onClick={() => navigate("/subscription")}
        variant="outline"
        className="w-full rounded-xl gap-2"
      >
        <Sparkles className="h-4 w-4 text-accent" />
        Generate with AI
        <Crown className="h-3.5 w-3.5 text-primary fill-primary ml-1" />
      </Button>
    );
  }

  // Not expanded yet — show trigger button
  if (!showForm && itinerary.length === 0) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        className="w-full rounded-xl gap-2"
      >
        <Sparkles className="h-4 w-4 text-accent" />
        Generate with AI
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Prompt input */}
      {itinerary.length === 0 && (
        <div className="space-y-3 bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">AI Itinerary Generator</span>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Additional preferences (optional)
            </Label>
            <Textarea
              placeholder="e.g. I love street food, want to avoid crowded spots..."
              className="rounded-xl bg-background min-h-[60px] resize-none text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-bold"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
            {!generating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setPrompt(""); }}
                className="rounded-xl text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {generating && streamText && (
        <div className="bg-card rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            <p className="text-[11px] font-semibold text-muted-foreground">AI is writing...</p>
          </div>
          <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono max-h-28 overflow-y-auto">
            {streamText.slice(-400)}
          </pre>
        </div>
      )}

      {/* Generated itinerary preview */}
      <AnimatePresence>
        {itinerary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              Preview — {itinerary.length} days generated
            </p>
            {itinerary.map((day, i) => (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl p-3 border border-border space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Day {day.day_number}
                  </span>
                  <span className="text-xs font-bold text-foreground">{day.title}</span>
                </div>
                <ul className="space-y-1">
                  {day.activities.map((a, j) => (
                    <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl gap-2 bg-primary text-primary-foreground h-10 text-sm"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save to Trip"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-xl gap-2 px-3"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InlineItineraryGenerator;
