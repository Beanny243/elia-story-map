// Map of countries/destinations to iconic Unsplash photos
const COUNTRY_IMAGES: Record<string, string> = {
  // Europe
  "france": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", // Eiffel Tower
  "italy": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80", // Amalfi Coast
  "spain": "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=600&q=80", // Barcelona
  "greece": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80", // Santorini
  "united kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80", // London
  "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80", // Neuschwanstein
  "netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80", // Amsterdam canals
  "portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80", // Lisbon tram
  "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80", // Swiss Alps
  "austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80", // Vienna
  "czech republic": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80", // Prague
  "turkey": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80", // Cappadocia
  "croatia": "https://images.unsplash.com/photo-1555990538-1e6c4120d16e?w=600&q=80", // Dubrovnik
  "iceland": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&q=80", // Northern lights
  "norway": "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=600&q=80", // Fjords
  "sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80", // Stockholm
  "ireland": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=600&q=80", // Cliffs of Moher
  "poland": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=600&q=80", // Krakow
  "hungary": "https://images.unsplash.com/photo-1541343672885-9be56236302a?w=600&q=80", // Budapest Parliament
  "belgium": "https://images.unsplash.com/photo-1559113202-c916b8e44373?w=600&q=80", // Brussels
  "romania": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80", // Bran Castle
  "denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80", // Copenhagen
  "finland": "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=600&q=80", // Finland winter

  // Asia
  "japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", // Mt Fuji & cherry blossoms
  "china": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80", // Great Wall
  "india": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80", // Taj Mahal
  "thailand": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80", // Thai temple
  "indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", // Bali temple
  "vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80", // Ha Long Bay
  "south korea": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80", // Seoul
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80", // Marina Bay
  "malaysia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80", // Petronas Towers
  "philippines": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80", // Palawan
  "cambodia": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&q=80", // Angkor Wat
  "nepal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80", // Himalayas
  "sri lanka": "https://images.unsplash.com/photo-1588598198321-9735fd52923c?w=600&q=80", // Sigiriya

  // Middle East
  "united arab emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", // Dubai Burj Khalifa
  "jordan": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=600&q=80", // Petra
  "israel": "https://images.unsplash.com/photo-1544735716-ea9ef790fcb0?w=600&q=80", // Jerusalem
  "saudi arabia": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80", // Desert
  "oman": "https://images.unsplash.com/photo-1569551429299-4f891aabda15?w=600&q=80", // Sultan Qaboos Mosque

  // Americas
  "united states": "https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=600&q=80", // NYC Statue of Liberty
  "canada": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80", // Banff
  "mexico": "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80", // Chichen Itza
  "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80", // Rio Christ Redeemer
  "argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80", // Buenos Aires
  "peru": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80", // Machu Picchu
  "colombia": "https://images.unsplash.com/photo-1583997052301-0042b33fc598?w=600&q=80", // Cartagena
  "chile": "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=600&q=80", // Patagonia
  "cuba": "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=600&q=80", // Havana cars
  "costa rica": "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=600&q=80", // Jungle

  // Africa
  "egypt": "https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=600&q=80", // Pyramids
  "morocco": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=80", // Marrakech
  "south africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80", // Cape Town
  "kenya": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80", // Safari
  "tanzania": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80", // Kilimanjaro
  "tunisia": "https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=600&q=80", // Sidi Bou Said
  "ethiopia": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80", // Lalibela

  // Oceania
  "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80", // Sydney Opera House
  "new zealand": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80", // Milford Sound
  "fiji": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80", // Tropical beach

  // Cities (common destinations)
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
  "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
  "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  "new york": "https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=600&q=80",
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  "barcelona": "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=600&q=80",
  "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80",
  "istanbul": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80",
  "bangkok": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
  "prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80",
  "lisbon": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80",
  "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80",
  "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80",
  "budapest": "https://images.unsplash.com/photo-1541343672885-9be56236302a?w=600&q=80",
  "cairo": "https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=600&q=80",
  "marrakech": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=80",
  "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  "sydney": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80",
  "rio de janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80",
  "santorini": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80",
  "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
  "hawaii": "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=600&q=80",
  "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80",
};

const FALLBACK = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80";

export function getCoverImageForDestination(destination: string): string {
  const key = destination.toLowerCase().trim();

  // Exact match
  if (COUNTRY_IMAGES[key]) return COUNTRY_IMAGES[key];

  // Partial match (e.g. "Paris, France" → match "paris" or "france")
  for (const [country, url] of Object.entries(COUNTRY_IMAGES)) {
    if (key.includes(country) || country.includes(key)) return url;
  }

  return FALLBACK;
}
