import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, Trash2, Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSupported: pushSupported, isSubscribed: pushEnabled, loading: pushLoading, permission, subscribe: enablePush, unsubscribe: disablePush } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          });
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
    setForm((prev) => ({ ...prev, avatar_url }));
    setUploading(false);
    toast({ title: "Photo uploaded!" });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name,
        bio: form.bio,
        avatar_url: form.avatar_url,
      })
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      navigate("/profile");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Contact support",
      description: "Account deletion requires contacting support.",
    });
  };

  return (
    <div className="px-5 pt-12 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="p-1.5 rounded-lg bg-card shadow-sm">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-display font-bold text-primary overflow-hidden">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              form.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-accent text-accent-foreground cursor-pointer shadow-md">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">Display Name</Label>
          <Input
            id="name"
            value={form.display_name}
            onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
            placeholder="Your name"
            className="bg-card"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell us about yourself…"
            className="bg-card resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3 pt-2">
        <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
          <Save className="h-4 w-4" /> {loading ? "Saving…" : "Save Changes"}
        </Button>
        <Button onClick={handleSignOut} variant="outline" className="w-full gap-2">
          Sign Out
        </Button>
        <Button onClick={handleDeleteAccount} variant="ghost" className="w-full gap-2 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete Account
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;
