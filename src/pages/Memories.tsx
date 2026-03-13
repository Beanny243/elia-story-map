import { Upload, X, Camera, MapPin, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MemoryCard from "@/components/shared/MemoryCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Memories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memories, setMemories] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split("T")[0]);
  const [tripId, setTripId] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("memories").select("*").eq("user_id", user.id).order("memory_date", { ascending: false }),
      supabase.from("trips").select("id, title, destination").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([memoriesRes, tripsRes]) => {
      if (memoriesRes.data) setMemories(memoriesRes.data);
      if (tripsRes.data) setTrips(tripsRes.data);
    });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setLocation("");
    setCaption("");
    setMemoryDate(new Date().toISOString().split("T")[0]);
    setTripId("");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let photoUrl: string | null = null;

    if (photoFile) {
      setUploading(true);
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(path, photoFile, { contentType: photoFile.type });

      if (uploadError) {
        setSaving(false);
        setUploading(false);
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: urlData } = supabase.storage.from("memories").getPublicUrl(path);
      photoUrl = urlData.publicUrl;
      setUploading(false);
    }

    const { data, error } = await supabase.from("memories").insert({
      user_id: user.id,
      photo_url: photoUrl,
      location: location || null,
      caption: caption || null,
      memory_date: memoryDate || null,
      trip_id: tripId || null,
    }).select().single();

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setMemories((prev) => [data, ...prev]);
    resetForm();
    setOpen(false);
    toast({ title: "Memory saved! 📸", description: "Your moment has been captured." });
  };

  return (
    <div className="px-5 pt-12 space-y-5 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Memories</h1>
        <p className="text-sm text-muted-foreground">Your travel timeline</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Button
          onClick={() => setOpen(true)}
          className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Upload className="h-4 w-4" /> Add Memory
        </Button>
      </motion.div>

      {memories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No memories yet. Start capturing your adventures!</p>
      ) : (
        <div className="relative pl-6 space-y-4 pb-4">
          <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-border" />
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-accent border-2 border-background z-10" />
              <MemoryCard
                photo={m.photo_url || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                location={m.location || "Unknown"}
                date={m.memory_date ? new Date(m.memory_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                caption={m.caption || ""}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Memory Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl p-5 gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">New Memory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo Upload */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/50 transition-colors"
              >
                <Camera className="h-8 w-8" />
                <span className="text-xs font-medium">Tap to add photo</span>
              </button>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                placeholder="e.g. Bali, Indonesia"
                className="rounded-xl bg-card"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date
              </Label>
              <Input
                type="date"
                className="rounded-xl bg-card"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Caption
              </Label>
              <Textarea
                placeholder="What made this moment special?"
                className="rounded-xl bg-card min-h-[70px] resize-none"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {trips.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Link to Trip (optional)</Label>
                <Select value={tripId} onValueChange={setTripId}>
                  <SelectTrigger className="rounded-xl bg-card">
                    <SelectValue placeholder="Select trip..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title} — {t.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl h-11 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                "Save Memory"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Memories;
