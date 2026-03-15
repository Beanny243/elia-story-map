import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, MapPin, X, Binoculars, Landmark, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ShareMenu from "@/components/community/ShareMenu";

const CATEGORIES = [
  { value: "wildlife", label: "Wildlife & Nature", icon: "🦁", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "landmarks", label: "Landmarks & Gems", icon: "🏛️", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "food_culture", label: "Food & Culture", icon: "🍜", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
];

const SpottingJournal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("wildlife");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      setLoading(true);
      let query = supabase.from("spotting_journal").select("*").eq("user_id", user.id).order("spotted_at", { ascending: false });
      if (filter !== "all") query = query.eq("category", filter);
      const { data } = await query;
      if (data) setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, [user, filter]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;
    setSubmitting(true);

    let photo_url: string | null = null;
    if (photoFile) {
      const path = `${user.id}/${Date.now()}-${photoFile.name}`;
      const { error: upErr } = await supabase.storage.from("community").upload(path, photoFile);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("community").getPublicUrl(path);
        photo_url = urlData.publicUrl;
      }
    }

    const { data, error } = await supabase.from("spotting_journal").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      species: species.trim() || null,
      location: location.trim() || null,
      photo_url,
    }).select().single();

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (data) setEntries((prev) => [data, ...prev]);
    toast({ title: "Spotted! 📸", description: "Entry added to your journal." });
    resetForm();
    setShowCreate(false);
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setSpecies(""); setLocation("");
    setPhotoFile(null); setPhotoPreview(null); setCategory("wildlife");
  };

  const getCat = (c: string) => CATEGORIES.find((cat) => cat.value === c) || CATEGORIES[0];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-card/80">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-display font-bold text-foreground">
            Spotting Journal
          </motion.h1>
          <p className="text-sm text-muted-foreground">Your personal travel discoveries</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        <Badge
          onClick={() => setFilter("all")}
          className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg border-0 ${filter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          📋 All
        </Badge>
        {CATEGORIES.map((c) => (
          <Badge
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg border-0 whitespace-nowrap ${filter === c.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {c.icon} {c.label}
          </Badge>
        ))}
      </div>

      {/* Entries */}
      <div className="px-5 space-y-3">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-12">Loading journal...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">🔭</p>
            <p className="text-sm text-muted-foreground">No spottings yet. Start documenting!</p>
            <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" /> Log a Spotting
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry, i) => {
              const cat = getCat(entry.category);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl shadow-card overflow-hidden"
                >
                  {entry.photo_url && (
                    <img src={entry.photo_url} alt={entry.title} className="w-full aspect-[16/9] object-cover" />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] font-bold border-0 ${cat.color}`}>
                        {cat.icon} {cat.label}
                      </Badge>
                      {entry.species && (
                        <span className="text-[10px] text-primary font-medium italic">{entry.species}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{entry.title}</h3>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {entry.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-accent" /> {entry.location}
                          </span>
                        )}
                        <span>{new Date(entry.spotted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <ShareMenu
                        title={entry.title}
                        text={`I spotted ${entry.title}${entry.location ? ` at ${entry.location}` : ""}! 🔭`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 z-40 h-12 w-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </motion.button>

      {/* Create Sheet */}
      <Sheet open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-display">Log a Spotting</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pt-4">
            {/* Category selector */}
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 p-3 rounded-xl text-center transition-all border-2 ${
                    category === c.value ? "border-accent bg-accent/10" : "border-transparent bg-secondary"
                  }`}
                >
                  <span className="text-xl block">{c.icon}</span>
                  <span className="text-[9px] text-muted-foreground font-medium">{c.label}</span>
                </button>
              ))}
            </div>

            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you spot?" className="rounded-xl" />
            {category === "wildlife" && (
              <Input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Species name (optional)" className="rounded-xl" />
            )}
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your discovery..." className="rounded-xl min-h-[80px] resize-none" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="📍 Where did you see it?" className="rounded-xl" />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full aspect-video object-cover" />
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-accent/40 transition-colors">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add a photo</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

            <Button onClick={handleSubmit} disabled={!title.trim() || submitting} className="w-full rounded-xl h-11 font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
              {submitting ? "Saving..." : "Save to Journal 📸"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SpottingJournal;
