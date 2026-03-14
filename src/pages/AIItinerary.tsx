import { ArrowLeft, Sparkles, Loader2, Save, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EliMascot from "@/components/shared/EliMascot";
import UpgradePrompt from "@/components/shared/UpgradePrompt";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

type ItineraryDay = { day_number: number; title: string; activities: string[] };

const AIItinerary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUseAI } = useSubscriptionGate();

  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("trips")
      .select("id, title, destination, start_date, end_date, travel_style, budget, companions")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTrips(data);
      });
  }, [user]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleGenerate = useCallback(async () => {
    if (!selectedTrip) {
      toast({ title: "Select a trip", description: "Please choose a trip first.", variant: "destructive" });
      return;
    }

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
            destination: selectedTrip.destination,
            startDate: selectedTrip.start_date,
            endDate: selectedTrip.end_date,
            travelStyle: selectedTrip.travel_style,
            budget: selectedTrip.budget,
            companions: selectedTrip.companions,
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

      // Parse the final JSON from streamed text
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
  }, [selectedTrip, prompt, toast]);

  const handleSave = async () => {
    if (!selectedTripId || itinerary.length === 0) return;
    setSaving(true);

    // Delete existing itinerary items for this trip
    await supabase.from("itinerary_items").delete().eq("trip_id", selectedTripId);

    const items = itinerary.map((day) => ({
      trip_id: selectedTripId,
      day_number: day.day_number,
      title: day.title,
      activities: day.activities,
    }));

    const { error } = await supabase.from("itinerary_items").insert(items);
    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Itinerary saved!", description: `${itinerary.length} days saved to your trip.` });
      navigate(`/trips/${selectedTripId}`);
    }
  };

  return (
    <div className="px-5 pt-10 space-y-5 pb-24">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">AI Itinerary</h1>
          <p className="text-xs text-muted-foreground">Generate a personalized day-by-day plan</p>
        </div>
      </motion.div>

      <EliMascot message="Pick a trip and I'll craft the perfect itinerary for you! ✨" size="sm" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Select Trip</Label>
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger className="rounded-xl bg-card">
              <SelectValue placeholder="Choose a trip..." />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.title} — {trip.destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTrip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-3 border border-border space-y-1">
            <p className="text-sm font-semibold text-foreground">{selectedTrip.title}</p>
            <p className="text-xs text-muted-foreground">
              📍 {selectedTrip.destination}
              {selectedTrip.start_date && ` • 📅 ${new Date(selectedTrip.start_date).toLocaleDateString()}`}
              {selectedTrip.end_date && ` → ${new Date(selectedTrip.end_date).toLocaleDateString()}`}
            </p>
            <div className="flex gap-2 flex-wrap mt-1">
              {selectedTrip.travel_style && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{selectedTrip.travel_style}</span>
              )}
              {selectedTrip.budget && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{selectedTrip.budget}</span>
              )}
              {selectedTrip.companions && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{selectedTrip.companions}</span>
              )}
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Additional Preferences (optional)</Label>
          <Textarea
            placeholder="e.g. I love street food, want to avoid crowded tourist spots, prefer morning activities..."
            className="rounded-xl bg-card min-h-[80px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !selectedTripId}
          className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-sm font-bold"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Itinerary
            </>
          )}
        </Button>
      </motion.div>

      {/* Streaming text while generating */}
      {generating && streamText && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <p className="text-xs font-semibold text-muted-foreground">AI is writing your itinerary...</p>
          </div>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
            {streamText.slice(-500)}
          </pre>
        </motion.div>
      )}

      {/* Parsed itinerary cards */}
      <AnimatePresence>
        {itinerary.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <h2 className="font-display font-bold text-lg text-foreground">Your Itinerary</h2>
            {itinerary.map((day, i) => (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-4 border border-border space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    Day {day.day_number}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{day.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {day.activities.map((activity, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl gap-2 bg-primary text-primary-foreground h-11"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save to Trip"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-xl gap-2 px-4"
              >
                <RotateCcw className="h-4 w-4" /> Regenerate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIItinerary;
