import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navigation, Locate } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import along from "@turf/along";
import turfLength from "@turf/length";
import { lineString } from "@turf/helpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TripInfoCard from "@/components/map/TripInfoCard";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYmVhbm55MjQzIiwiYSI6ImNtbXBiMjQzdDBvcDIycHF0NmY3ZHBxcmsifQ.xNcSuOwjYejAP-Rl1u_kwA";

const TRIP_COLORS = [
  "hsl(18, 100%, 62%)",
  "hsl(210, 100%, 60%)",
  "hsl(150, 70%, 50%)",
  "hsl(280, 80%, 65%)",
  "hsl(45, 100%, 55%)",
  "hsl(340, 85%, 60%)",
  "hsl(180, 70%, 50%)",
  "hsl(0, 80%, 60%)",
];

interface StopData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  sort_order: number;
  trip_id: string;
}

interface TripMeta {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
}

const MapScreen = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animFrameRef = useRef<number[]>([]);
  const { user } = useAuth();
  const [stops, setStops] = useState<StopData[]>([]);
  const [trips, setTrips] = useState<TripMeta[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const tripColorMapRef = useRef<Map<string, string>>(new Map());

  // Fetch trip stops and trip metadata
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: tripsData } = await supabase
        .from("trips")
        .select("id, title, destination, start_date, end_date, cover_image")
        .eq("user_id", user.id);

      if (!tripsData) return;
      setTrips(tripsData);

      const tripIds = new Set(tripsData.map((t) => t.id));

      const { data: stopsData } = await supabase
        .from("trip_stops")
        .select("city, country, latitude, longitude, trip_id, sort_order")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("sort_order", { ascending: true });

      if (stopsData) {
        setStops(
          stopsData
            .filter((s) => tripIds.has(s.trip_id))
            .map((s) => ({
              city: s.city,
              country: s.country,
              latitude: s.latitude!,
              longitude: s.longitude!,
              sort_order: s.sort_order ?? 0,
              trip_id: s.trip_id,
            }))
        );
      }
    };
    fetchData();
  }, [user]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [12, 30],
      zoom: 1.8,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.on("load", () => setMapLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Highlight / unhighlight trip lines
  const updateLineStyles = (activeTripId: string | null) => {
    if (!map.current) return;
    const tripIds = [...new Set(stops.map((s) => s.trip_id))];

    tripIds.forEach((tripId) => {
      const layerId = `route-line-${tripId}`;
      if (!map.current?.getLayer(layerId)) return;

      if (activeTripId === null) {
        // Reset all to default
        map.current.setPaintProperty(layerId, "line-width", 2.5);
        map.current.setPaintProperty(layerId, "line-opacity", 0.7);
      } else if (tripId === activeTripId) {
        // Highlight selected
        map.current.setPaintProperty(layerId, "line-width", 5);
        map.current.setPaintProperty(layerId, "line-opacity", 1);
      } else {
        // Dim others
        map.current.setPaintProperty(layerId, "line-width", 1.5);
        map.current.setPaintProperty(layerId, "line-opacity", 0.25);
      }
    });
  };

  // Add markers and route lines
  useEffect(() => {
    if (!map.current || !mapLoaded || stops.length === 0) return;

    // Clean up
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    animFrameRef.current.forEach((id) => cancelAnimationFrame(id));
    animFrameRef.current = [];

    const style = map.current.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-line-") && map.current?.getLayer(layer.id)) {
          map.current.removeLayer(layer.id);
        }
      });
    }
    // Also remove hit layers
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-hit-") && map.current?.getLayer(layer.id)) {
          map.current.removeLayer(layer.id);
        }
      });
    }
    if (style?.sources) {
      Object.keys(style.sources).forEach((src) => {
        if (src.startsWith("route-") && map.current?.getSource(src)) {
          map.current.removeSource(src);
        }
      });
    }

    const tripIds = [...new Set(stops.map((s) => s.trip_id))];
    const colorMap = new Map(tripIds.map((id, i) => [id, TRIP_COLORS[i % TRIP_COLORS.length]]));
    tripColorMapRef.current = colorMap;

    // Markers
    stops.forEach((stop, index) => {
      const color = colorMap.get(stop.trip_id) || TRIP_COLORS[0];
      const el = document.createElement("div");
      el.className = "mapbox-custom-marker";
      el.style.opacity = "0";
      el.style.transform = "scale(0.5) translateY(10px)";
      el.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: ${color}; color: white;
            font-size: 10px; font-weight: 700;
            padding: 2px 8px; border-radius: 999px;
            margin-bottom: 4px; white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${stop.city}</div>
          <div style="
            width: 12px; height: 12px; border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          "></div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${stop.city}</strong><br/><span style="color:#888">${stop.country}</span>`
          )
        )
        .addTo(map.current!);
      markersRef.current.push(marker);

      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "scale(1) translateY(0)";
      }, 200 + index * 100);
    });

    // Animated route lines
    const STEPS = 120;

    tripIds.forEach((tripId, tripIndex) => {
      const tripStops = stops
        .filter((s) => s.trip_id === tripId)
        .sort((a, b) => a.sort_order - b.sort_order);

      if (tripStops.length < 2) return;

      const coordinates = tripStops.map((s) => [s.longitude, s.latitude] as [number, number]);
      const color = colorMap.get(tripId) || TRIP_COLORS[0];
      const sourceId = `route-${tripId}`;
      const layerId = `route-line-${tripId}`;
      const hitLayerId = `route-hit-${tripId}`;

      const fullLine = lineString(coordinates);
      const totalLength = turfLength(fullLine, { units: "kilometers" });

      map.current!.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [coordinates[0], coordinates[0]] },
        },
      });

      // Visible line
      map.current!.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": color,
          "line-width": 2.5,
          "line-dasharray": [2, 3],
          "line-opacity": 0.7,
        },
      });

      // Invisible wider hit area for easier tapping
      map.current!.addLayer({
        id: hitLayerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": color,
          "line-width": 20,
          "line-opacity": 0,
        },
      });

      // Click handler on the hit layer
      map.current!.on("click", hitLayerId, (e) => {
        e.originalEvent.stopPropagation();
        setSelectedTripId((prev) => (prev === tripId ? null : tripId));
      });

      // Pointer cursor on hover
      map.current!.on("mouseenter", hitLayerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current!.on("mouseleave", hitLayerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });

      // Animate
      const startDelay = 400 + tripIndex * 300;
      let step = 0;

      const animate = () => {
        step++;
        const progress = Math.min(step / STEPS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentLength = eased * totalLength;

        const partialCoords: [number, number][] = [coordinates[0]];
        let accumulated = 0;

        for (let i = 1; i < coordinates.length; i++) {
          const segLine = lineString([coordinates[i - 1], coordinates[i]]);
          const segLength = turfLength(segLine, { units: "kilometers" });

          if (accumulated + segLength <= currentLength) {
            partialCoords.push(coordinates[i]);
            accumulated += segLength;
          } else {
            const remaining = currentLength - accumulated;
            if (remaining > 0) {
              const point = along(segLine, remaining, { units: "kilometers" });
              partialCoords.push(point.geometry.coordinates as [number, number]);
            }
            break;
          }
        }

        const source = map.current?.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (source && partialCoords.length >= 2) {
          source.setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: partialCoords },
          });
        }

        if (progress < 1) {
          const id = requestAnimationFrame(animate);
          animFrameRef.current.push(id);
        }
      };

      setTimeout(() => {
        const id = requestAnimationFrame(animate);
        animFrameRef.current.push(id);
      }, startDelay);
    });

    // Click on empty map to deselect
    map.current.on("click", (e) => {
      // Check if the click hit any route hit layer
      const hitLayers = tripIds
        .map((id) => `route-hit-${id}`)
        .filter((id) => map.current?.getLayer(id));
      const features = map.current?.queryRenderedFeatures(e.point, { layers: hitLayers });
      if (!features || features.length === 0) {
        setSelectedTripId(null);
      }
    });

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    stops.forEach((s) => bounds.extend([s.longitude, s.latitude]));
    if (stops.length > 1) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 6 });
    } else {
      map.current.flyTo({ center: [stops[0].longitude, stops[0].latitude], zoom: 5 });
    }
  }, [stops, mapLoaded]);

  // Update line styles when selection changes
  useEffect(() => {
    updateLineStyles(selectedTripId);
  }, [selectedTripId, stops]);

  const handleLocateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 10,
          duration: 2000,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  // Build selected trip info for the card
  const selectedTripInfo = selectedTripId
    ? (() => {
        const tripMeta = trips.find((t) => t.id === selectedTripId);
        if (!tripMeta) return null;
        const tripStops = stops.filter((s) => s.trip_id === selectedTripId);
        return {
          ...tripMeta,
          color: tripColorMapRef.current.get(selectedTripId) || TRIP_COLORS[0],
          stopCount: tripStops.length,
        };
      })()
    : null;

  return (
    <div className="relative h-screen">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-12 left-5 right-5 z-10"
      >
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-elevated flex items-center gap-3">
          <Navigation className="h-5 w-5 text-accent" />
          <div>
            <h2 className="font-display font-bold text-sm text-foreground">Your Travel Map</h2>
            <p className="text-[11px] text-muted-foreground">
              {stops.length > 0
                ? `${stops.length} stops • ${new Set(stops.map((s) => s.country)).size} countries`
                : "Add trip stops to see them on the map"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Trip info card */}
      <TripInfoCard
        trip={selectedTripInfo}
        onClose={() => setSelectedTripId(null)}
      />

      {/* Locate me button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleLocateMe}
        className="absolute bottom-28 right-5 z-10 bg-card/90 backdrop-blur-lg p-3 rounded-full shadow-elevated"
      >
        <Locate className="h-5 w-5 text-accent" />
      </motion.button>
    </div>
  );
};

export default MapScreen;
