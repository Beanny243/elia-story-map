const MAPBOX_TOKEN = "pk.eyJ1IjoiYmVhbm55MjQzIiwiYSI6ImNtbXBiMjQzdDBvcDIycHF0NmY3ZHBxcmsifQ.xNcSuOwjYejAP-Rl1u_kwA";

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,region,country&limit=1`
    );
    const data = await res.json();

    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    // Extract city and country from context
    const city =
      feature.text ||
      query.split(",")[0].trim();

    const countryContext = feature.context?.find((c: any) =>
      c.id?.startsWith("country")
    );
    const country = countryContext?.text || query.split(",").pop()?.trim() || "";

    return { latitude, longitude, city, country };
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}
