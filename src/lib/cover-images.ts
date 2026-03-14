// Deterministic cover image based on destination
const TRAVEL_PHOTOS = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80", // Paris
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80", // Venice
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80", // Beach
  "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80", // Tokyo
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80", // Mountains
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", // Dubai
  "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=600&q=80", // Barcelona
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", // Paris Eiffel
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80", // Italy coast
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80", // Santorini
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80", // London
  "https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=600&q=80", // NYC
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", // Bali
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80", // India
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80", // Morocco
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCoverImageForDestination(destination: string): string {
  const index = hashString(destination.toLowerCase().trim()) % TRAVEL_PHOTOS.length;
  return TRAVEL_PHOTOS[index];
}
