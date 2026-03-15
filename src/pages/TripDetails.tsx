import { ArrowLeft, MapPin, Plane, Train, Bus, Ship, ChevronRight, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MemoryCard from "@/components/shared/MemoryCard";
import InlineItineraryGenerator from "@/components/trip/InlineItineraryGenerator";
import ItineraryDayCard from "@/components/trip/ItineraryDayCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-accent text-accent-foreground" },
  completed: { label: "Completed", className: "bg-primary text-primary-foreground" },
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

    // Reassign day_numbers sequentially
    const updated = reordered.map((d, i) => ({ ...d, day_number: i + 1 }));
    setItinerary(updated);

    // Persist all day_number changes
    await Promise.all(
      updated.map((d) =>
        supabase.from("itinerary_items").update({ day_number: d.day_number }).eq("id", d.id)
      )
    );
  };

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
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
    fetch();
  }, [id]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading trip...</p>
      </div>
    );
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

  return (
    <div className="pb-8">
      <div className="relative h-52">
        <img
          src={trip.cover_image || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80"}
          alt="Trip cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-10 left-4 p-2 rounded-xl bg-card/80 backdrop-blur-sm">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-2xl font-display font-bold text-foreground">{trip.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent" /> {trip.destination} • {formatDate(trip.start_date)}–{formatDate(trip.end_date)}
          </p>
        </div>
      </div>

      <div className="px-5 pt-3">
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
          <SelectTrigger className="w-fit rounded-xl gap-2 h-8 text-xs border-0 bg-card/80 px-3">
            <Badge className={`text-[10px] font-bold border-0 ${statusConfig[trip.status || "draft"]?.className}`}>
              {statusConfig[trip.status || "draft"]?.label || "Draft"}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">📝 Draft</SelectItem>
            <SelectItem value="active">✈️ Active</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="px-5 pt-4">
        <Tabs defaultValue="stops">
          <TabsList className="w-full bg-secondary rounded-xl">
            <TabsTrigger value="stops" className="flex-1 rounded-lg text-xs">Stops</TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 rounded-lg text-xs">Itinerary</TabsTrigger>
            <TabsTrigger value="memories" className="flex-1 rounded-lg text-xs">Memories</TabsTrigger>
          </TabsList>

          <TabsContent value="stops" className="mt-4 space-y-2">
            {stops.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No stops added yet.</p>
            ) : (
              stops.map((stop, i) => {
                const TransportIcon = transportIcons[stop.transport_type] || Plane;
                return (
                  <motion.div key={stop.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TransportIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{stop.city}</p>
                      <p className="text-[11px] text-muted-foreground">{stop.country} • {formatDate(stop.arrive_date)} → {formatDate(stop.depart_date)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="itinerary" className="mt-4 space-y-3">
            {itinerary.length === 0 ? (
              <div className="space-y-3 py-2">
                <p className="text-sm text-muted-foreground text-center">No itinerary items yet.</p>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-dashed border-muted-foreground/30"
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
                  className="w-full rounded-xl gap-2 border-dashed border-muted-foreground/30"
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

          <TabsContent value="memories" className="mt-4 space-y-3">
            {memories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No memories for this trip yet.</p>
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
      </div>
    </div>
  );
};

export default TripDetails;
