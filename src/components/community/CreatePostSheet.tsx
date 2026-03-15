import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreatePostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreatePostSheet = ({ open, onOpenChange, onCreated }: CreatePostSheetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("experience");
  const [category, setCategory] = useState("general");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim() || null,
      post_type: postType,
      category,
      location: location.trim() || null,
      photo_url,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Posted!", description: "Your post is now live in the community." });
    setTitle(""); setBody(""); setLocation(""); setPhotoFile(null); setPhotoPreview(null);
    onOpenChange(false);
    onCreated();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-display">Share with the Community</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className="rounded-xl text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experience">🌍 Experience</SelectItem>
                <SelectItem value="sighting">👀 Sighting</SelectItem>
                <SelectItem value="tip">💡 Tip</SelectItem>
                <SelectItem value="question">❓ Question</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">🌍 General</SelectItem>
                <SelectItem value="wildlife">🦁 Wildlife</SelectItem>
                <SelectItem value="landmarks">🏛️ Landmarks</SelectItem>
                <SelectItem value="food_culture">🍜 Food & Culture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title..."
            className="rounded-xl"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience, tip, or question..."
            className="rounded-xl min-h-[100px] resize-none"
          />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="📍 Location (e.g. Serengeti, Tanzania)"
            className="rounded-xl"
          />

          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full aspect-video object-cover" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-accent/40 transition-colors"
            >
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add a photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="w-full rounded-xl h-11 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? "Posting..." : "Post to Community"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreatePostSheet;
