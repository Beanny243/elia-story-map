import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Pencil, Trash2, Check, X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItineraryDayCardProps {
  day: {
    id: string;
    day_number: number;
    title: string;
    activities: string[];
    trip_id: string;
  };
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updated: any) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ItineraryDayCard = ({
  day,
  index,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ItineraryDayCardProps) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(day.title);
  const [activities, setActivities] = useState<string[]>(day.activities || []);
  const [newActivity, setNewActivity] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("itinerary_items")
      .update({ title, activities })
      .eq("id", day.id)
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    onUpdate(data);
    setEditing(false);
    toast({ title: "Day updated", description: `Day ${day.day_number} saved.` });
  };

  const handleCancel = () => {
    setTitle(day.title);
    setActivities(day.activities || []);
    setNewActivity("");
    setEditing(false);
  };

  const handleDeleteDay = async () => {
    const { error } = await supabase.from("itinerary_items").delete().eq("id", day.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    onDelete(day.id);
    toast({ title: "Day removed", description: `Day ${day.day_number} deleted.` });
  };

  const removeActivity = (idx: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== idx));
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setActivities((prev) => [...prev, newActivity.trim()]);
    setNewActivity("");
  };

  if (editing) {
    return (
      <motion.div
        layout
        className="bg-card rounded-xl p-4 shadow-card space-y-3 border-2 border-accent/30"
      >
        <div className="flex items-center gap-2">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
            Day {day.day_number}
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm font-semibold rounded-lg bg-background"
            placeholder="Day title"
          />
        </div>

        <ul className="space-y-1.5">
          {activities.map((a, j) => (
            <li key={j} className="flex items-center gap-2 group">
              <div className="h-1 w-1 rounded-full bg-accent shrink-0" />
              <span className="text-xs text-foreground flex-1">{a}</span>
              <button
                onClick={() => removeActivity(j)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-1.5">
          <Input
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addActivity()}
            className="h-7 text-xs rounded-lg bg-background flex-1"
            placeholder="Add activity..."
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={addActivity}
            className="h-7 w-7 p-0 shrink-0"
            disabled={!newActivity.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 rounded-lg gap-1.5 h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="rounded-lg h-8 text-xs text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDeleteDay}
            className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card rounded-xl p-4 shadow-card space-y-2 group"
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0 disabled:opacity-20"
          >
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0 disabled:opacity-20"
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
        <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
          Day {day.day_number}
        </span>
        <span className="text-sm font-semibold text-foreground flex-1">{day.title}</span>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <ul className="space-y-1">
        {(day.activities || []).map((a: string, j: number) => (
          <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-accent" />
            {a}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ItineraryDayCard;
