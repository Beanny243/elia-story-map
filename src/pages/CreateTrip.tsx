import { ArrowLeft, Sparkles, Calendar, DollarSign, Users, MapPin, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EliMascot from "@/components/shared/EliMascot";

const CreateTrip = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-10 space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Create Trip</h1>
          <p className="text-xs text-muted-foreground">Plan your next adventure</p>
        </div>
      </motion.div>

      <EliMascot message="Tell me about your dream trip!" size="sm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" /> Trip Title
          </Label>
          <Input placeholder="e.g. Italian Summer 2025" className="rounded-xl bg-card" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Destination
          </Label>
          <Input placeholder="e.g. Rome, Italy" className="rounded-xl bg-card" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Start Date
            </Label>
            <Input type="date" className="rounded-xl bg-card" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> End Date
            </Label>
            <Input type="date" className="rounded-xl bg-card" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Travel Style</Label>
          <Select>
            <SelectTrigger className="rounded-xl bg-card">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adventure">🏔 Adventure</SelectItem>
              <SelectItem value="cultural">🏛 Cultural</SelectItem>
              <SelectItem value="relaxation">🏖 Relaxation</SelectItem>
              <SelectItem value="foodie">🍕 Foodie</SelectItem>
              <SelectItem value="romantic">💕 Romantic</SelectItem>
              <SelectItem value="backpacking">🎒 Backpacking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Budget
          </Label>
          <Select>
            <SelectTrigger className="rounded-xl bg-card">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">💰 Budget ($500–1000)</SelectItem>
              <SelectItem value="mid">💰💰 Mid-range ($1000–3000)</SelectItem>
              <SelectItem value="luxury">💰💰💰 Luxury ($3000+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Travel Companions
          </Label>
          <Select>
            <SelectTrigger className="rounded-xl bg-card">
              <SelectValue placeholder="Who's coming?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">🧍 Solo</SelectItem>
              <SelectItem value="couple">💑 Couple</SelectItem>
              <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
              <SelectItem value="friends">👯 Friends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2 pt-2"
      >
        <Button className="w-full rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-sm font-bold">
          <Sparkles className="h-4 w-4" /> Generate AI Itinerary
        </Button>
        <Button variant="outline" className="w-full rounded-xl h-11">
          Save as Draft
        </Button>
      </motion.div>
    </div>
  );
};

export default CreateTrip;
