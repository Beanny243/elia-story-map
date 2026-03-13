import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navigation, Locate } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import along from "@turf/along";
import turfLength from "@turf/length";
import { lineString } from "@turf/helpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYmVhbm55MjQzIiwiYSI6ImNtbXBiMjQzdDBvcDIycHF0NmY3ZHBxcmsifQ.xNcSuOwjYejAP-Rl1u_kwA";

const TRIP_COLORS = [
  "hsl(18, 100%, 62%)",   // orange (accent)
  "hsl(210, 100%, 60%)",  // blue
  "hsl(150, 70%, 50%)",   // green
  "hsl(280, 80%, 65%)",   // purple
  "hsl(45, 100%, 55%)",   // gold
  "hsl(340, 85%, 60%)",   // pink
  "hsl(180, 70%, 50%)",   // teal
  "hsl(0, 80%, 60%)",     // red
];

interface StopData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  sort_order: number;
  trip_id: string;
}

const MapScreen = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animFrameRef = useRef<number[]>([]);
  const { user } = useAuth();
  const [stops, setStops] = useState<StopData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch trip stops with coordinates
  useEffect(() => {
    const fetchStops = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("trip_stops")
        .select("city, country, latitude, longitude, trip_id, sort_order")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("sort_order", { ascending: true });

      if (data) {
        const { data: trips } = await supabase
          .from("trips")
          .select("id")
          .eq("user_id", user.id);

        const tripIds = new Set(trips?.map((t) => t.id) || []);
        const userStops = data.filter((s) => tripIds.has(s.trip_id));
        setStops(
          userStops.map((s) => ({
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
    fetchStops();
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

  // Add markers for trip stops
  useEffect(() => {
    if (!map.current || !mapLoaded || stops.length === 0) return;

    // Clean up previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Cancel previous animations
    animFrameRef.current.forEach((id) => cancelAnimationFrame(id));
    animFrameRef.current = [];

    // Clean up previous route layers/sources
    const style = map.current.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-line-") && map.current?.getLayer(layer.id)) {
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

    // Group stops by trip
    const tripIds = [...new Set(stops.map((s) => s.trip_id))];
    const tripColorMap = new Map(tripIds.map((id, i) => [id, TRIP_COLORS[i % TRIP_COLORS.length]]));

    // Add markers with per-trip colors (fade in with stagger)
    stops.forEach((stop, index) => {
      const color = tripColorMap.get(stop.trip_id) || TRIP_COLORS[0];
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

      // Staggered fade-in
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "scale(1) translateY(0)";
      }, 200 + index * 100);
    });

    // Animate per-trip route lines
    const ANIMATION_DURATION = 2000; // ms
    const STEPS = 120;

    tripIds.forEach((tripId, tripIndex) => {
      const tripStops = stops
        .filter((s) => s.trip_id === tripId)
        .sort((a, b) => a.sort_order - b.sort_order);

      if (tripStops.length < 2) return;

      const coordinates = tripStops.map((s) => [s.longitude, s.latitude] as [number, number]);
      const color = tripColorMap.get(tripId) || TRIP_COLORS[0];
      const sourceId = `route-${tripId}`;
      const layerId = `route-line-${tripId}`;

      const fullLine = lineString(coordinates);
      const totalLength = turfLength(fullLine, { units: "kilometers" });

      // Start with empty line (first point only)
      map.current!.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [coordinates[0], coordinates[0]] },
        },
      });

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

      // Animate after a stagger delay per trip
      const startDelay = 400 + tripIndex * 300;
      let step = 0;

      const animate = () => {
        step++;
        const progress = Math.min(step / STEPS, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentLength = eased * totalLength;

        // Build partial line
        const partialCoords: [number, number][] = [coordinates[0]];
        let accumulated = 0;

        for (let i = 1; i < coordinates.length; i++) {
          const segLine = lineString([coordinates[i - 1], coordinates[i]]);
          const segLength = turfLength(segLine, { units: "kilometers" });

          if (accumulated + segLength <= currentLength) {
            partialCoords.push(coordinates[i]);
            accumulated += segLength;
          } else {
            // Interpolate along this segment
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

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    stops.forEach((s) => bounds.extend([s.longitude, s.latitude]));
    if (stops.length > 1) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 6 });
    } else {
      map.current.flyTo({ center: [stops[0].longitude, stops[0].latitude], zoom: 5 });
    }
  }, [stops, mapLoaded]);

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

  return (
    <div className="relative h-screen">
      {/* Mapbox container */}
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
