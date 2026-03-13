import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navigation, Locate } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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

    // Remove previous route layer/source if exists
    if (map.current.getLayer("route-line")) map.current.removeLayer("route-line");
    if (map.current.getSource("route")) map.current.removeSource("route");

    stops.forEach((stop) => {
      const el = document.createElement("div");
      el.className = "mapbox-custom-marker";
      el.innerHTML = `
        <div style="
          display: flex; flex-direction: column; align-items: center; cursor: pointer;
        ">
          <div style="
            background: hsl(18, 100%, 62%); color: white;
            font-size: 10px; font-weight: 700;
            padding: 2px 8px; border-radius: 999px;
            margin-bottom: 4px; white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${stop.city}</div>
          <div style="
            width: 12px; height: 12px; border-radius: 50%;
            background: hsl(18, 100%, 62%);
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          "></div>
        </div>
      `;

      new mapboxgl.Marker({ element: el })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${stop.city}</strong><br/><span style="color:#888">${stop.country}</span>`
          )
        )
        .addTo(map.current!);
    });

    // Draw route line connecting stops in order
    if (stops.length > 1) {
      const sortedStops = [...stops].sort((a, b) => a.sort_order - b.sort_order);
      const coordinates = sortedStops.map((s) => [s.longitude, s.latitude]);

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "hsl(18, 100%, 62%)",
          "line-width": 2.5,
          "line-dasharray": [2, 3],
          "line-opacity": 0.7,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      stops.forEach((s) => bounds.extend([s.longitude, s.latitude]));
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 6 });
    } else if (stops.length === 1) {
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
