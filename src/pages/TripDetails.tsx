import { ArrowLeft, MapPin, Plane, Train, Bus, Ship, ChevronRight, Plus, ImageOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MemoryCard from "@/components/shared/MemoryCard";
import InlineItineraryGenerator from "@/components/trip/InlineItineraryGenerator";
import ItineraryDayCard from "@/components/trip/ItineraryDayCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  draft: { label: "Draft", emoji: "📝", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", emoji: "✈️", className: "bg-accent text-accent-foreground" },
  completed: { label: "Completed", emoji: "✅", className: "bg-primary/15 text-primary" },
};

const transportIcons: Record<string, typeof Plane> = { flight: Plane, train: Train, bus: Bus, ferry: Ship };

const TripDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { isPremium } = useSubscriptionGate();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);

  const handleAddDay = async () => {
    if (!id) return;
    const nextDayNumber = itinerary.length > 0
      ? Math.max(...itinerary.map((d: any) => d.day_number)) + 1
      : 1;
    const { data, error } = await supabase
      .from("itinerary_items")
      .insert({ trip_id: id, day_number: nextDayNumber, title: `Day ${nextDayNumber}`, activities: [] })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (data) setItinerary((prev) => [...prev, data].sort((a, b) => a.day_number - b.day_number));
    toast({ title: "Day added", description: `Day ${nextDayNumber} created.` });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itinerary.findIndex((d) => d.id === active.id);
    const newIndex = itinerary.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(itinerary, oldIndex, newIndex);
    const updated = reordered.map((d, i) => ({ ...d, day_number: i + 1 }));
    setItinerary(updated);
    await Promise.all(
      updated.map((d) =>
        supabase.from("itinerary_items").update({ day_number: d.day_number }).eq("id", d.id)
      )
    );
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [tripRes, stopsRes, itinRes, memRes] = await Promise.all([
        supabase.from("trips").select("*").eq("id", id).single(),
        supabase.from("trip_stops").select("*").eq("trip_id", id).order("sort_order"),
        supabase.from("itinerary_items").select("*").eq("trip_id", id).order("day_number"),
        supabase.from("memories").select("*").eq("trip_id", id).order("memory_date"),
      ]);
      if (tripRes.data) setTrip(tripRes.data);
      if (stopsRes.data) setStops(stopsRes.data);
      if (itinRes.data) setItinerary(itinRes.data);
      if (memRes.data) setMemories(memRes.data);
    };
    fetchData();
  }, [id]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

  if (!trip) {
    return (
      <div className="pb-8">
        <Skeleton className="h-56 w-full" />
        <div className="px-5 pt-4 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[trip.status || "draft"] || statusConfig.draft;

  return (
    <div className="pb-28">
      {/* Hero Cover */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={trip.cover_image || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80"}
          alt="Trip cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-4 p-2.5 rounded-2xl bg-card/70 backdrop-blur-md border border-border/30 shadow-sm hover:bg-card/90 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute bottom-5 left-5 right-5"
        >
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{trip.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {trip.destination} • {formatDate(trip.start_date)}–{formatDate(trip.end_date)}
          </p>
        </motion.div>
      </div>

      {/* Status Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="px-5 pt-4"
      >
        <Select
          value={trip.status || "draft"}
          onValueChange={async (val) => {
            const { error } = await supabase.from("trips").update({ status: val }).eq("id", id);
            if (error) {
              toast({ title: "Error", description: error.message, variant: "destructive" });
            } else {
              setTrip((prev: any) => ({ ...prev, status: val }));
              toast({ title: "Status updated", description: `Trip marked as ${statusConfig[val]?.label || val}.` });
            }
          }}
        >
          <SelectTrigger className="w-fit rounded-2xl gap-2 h-9 text-xs border-border/40 bg-card shadow-sm px-3">
            <Badge className={`text-[10px] font-bold border-0 rounded-lg px-2 py-0.5 ${currentStatus.className}`}>
              {currentStatus.emoji} {currentStatus.label}
            </Badge>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50 shadow-lg">
            <SelectItem value="draft">📝 Draft</SelectItem>
            <SelectItem value="active">✈️ Active</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 pt-5"
      >
        <Tabs defaultValue="stops">
          <TabsList className="w-full bg-muted/60 rounded-2xl p-1 h-11">
            <TabsTrigger value="stops" className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:shadow-sm">Stops</TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:shadow-sm">Itinerary</TabsTrigger>
            <TabsTrigger value="memories" className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:shadow-sm">Memories</TabsTrigger>
          </TabsList>

          {/* Stops Tab */}
          <TabsContent value="stops" className="mt-4 space-y-2.5">
            {stops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No stops added yet.</p>
              </div>
            ) : (
              stops.map((stop, i) => {
                const TransportIcon = transportIcons[stop.transport_type] || Plane;
                return (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-2xl p-3.5 shadow-sm border border-border/30 flex items-center gap-3 hover:shadow-md transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <TransportIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{stop.city}</p>
                      <p className="text-[11px] text-muted-foreground">{stop.country} • {formatDate(stop.arrive_date)} → {formatDate(stop.depart_date)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="mt-4 space-y-3">
            {itinerary.length === 0 ? (
              <div className="space-y-3 py-2">
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No itinerary items yet.</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl gap-2 border-dashed border-muted-foreground/20 h-11 text-sm hover:bg-muted/40 transition-colors"
                  onClick={handleAddDay}
                >
                  <Plus className="h-4 w-4" /> Add Day Manually
                </Button>
                <InlineItineraryGenerator
                  trip={trip}
                  onSaved={(items) =>
                    setItinerary(items.map((d, i) => ({ ...d, id: `gen-${i}` })))
                  }
                />
              </div>
            ) : (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={itinerary.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {itinerary.map((day, i) => (
                      <ItineraryDayCard
                        key={day.id}
                        day={day}
                        index={i}
                        onUpdate={(updated) =>
                          setItinerary((prev) =>
                            prev.map((d) => (d.id === updated.id ? updated : d))
                          )
                        }
                        onDelete={(deletedId) =>
                          setItinerary((prev) => prev.filter((d) => d.id !== deletedId))
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl gap-2 border-dashed border-muted-foreground/20 h-11 text-sm hover:bg-muted/40 transition-colors"
                  onClick={handleAddDay}
                >
                  <Plus className="h-4 w-4" /> Add Day
                </Button>
                <InlineItineraryGenerator
                  trip={trip}
                  onSaved={(items) =>
                    setItinerary(items.map((d, i) => ({ ...d, id: `gen-${i}` })))
                  }
                />
              </>
            )}
          </TabsContent>

          {/* Memories Tab */}
          <TabsContent value="memories" className="mt-4 space-y-3">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No memories for this trip yet.</p>
              </div>
            ) : (
              memories.map((m) => (
                <MemoryCard
                  key={m.id}
                  photo={m.photo_url || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80"}
                  location={m.location || "Unknown"}
                  date={m.memory_date ? new Date(m.memory_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  caption={m.caption || ""}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default TripDetails;
