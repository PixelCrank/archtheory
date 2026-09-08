"use client";

import { useMemo, useState } from "react";
import MapGL, {
  Marker,
  NavigationControl,
} from "react-map-gl/mapbox";
import type { TimelineBuilding, ChildMovement, MacroMovement } from "@/lib/timelineData";
import { ERA_COLORS } from "@/components/timeline/palettes";
import { DetailPanel } from "@/components/timeline/DetailPanel";
import { useSharedFilters } from "@/hooks/useSharedFilters";
import "mapbox-gl/dist/mapbox-gl.css";

// ---------------------------------------------------------------------------
// Location coordinate lookup table
// ---------------------------------------------------------------------------
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  "rome": [41.9028, 12.4964], "italy": [41.9028, 12.4964], "milan": [45.4642, 9.19],
  "florence": [43.7696, 11.2558], "venice": [45.4408, 12.3155], "naples": [40.8518, 14.2681],
  "paris": [48.8566, 2.3522], "france": [46.2276, 2.2137], "lyon": [45.764, 4.8357],
  "marseille": [43.2965, 5.3698], "london": [51.5074, -0.1278], "england": [52.3555, -1.1743],
  "united kingdom": [55.3781, -3.436], "uk": [55.3781, -3.436], "britain": [52.3555, -1.1743],
  "scotland": [56.4907, -4.2026], "edinburgh": [55.9533, -3.1883], "glasgow": [55.8642, -4.2518],
  "germany": [51.1657, 10.4515], "berlin": [52.52, 13.405], "munich": [48.1351, 11.582],
  "cologne": [50.9375, 6.9603], "frankfurt": [50.1109, 8.6821], "hamburg": [53.5511, 9.9937],
  "spain": [40.4637, -3.7492], "barcelona": [41.3874, 2.1686], "madrid": [40.4168, -3.7038],
  "seville": [37.3891, -5.9845], "portugal": [39.3999, -8.2245], "lisbon": [38.7223, -9.1393],
  "netherlands": [52.1326, 5.2913], "amsterdam": [52.3676, 4.9041], "rotterdam": [51.9244, 4.4777],
  "belgium": [50.5039, 4.4699], "brussels": [50.8503, 4.3517], "bruges": [51.2093, 3.2247],
  "switzerland": [46.8182, 8.2275], "zurich": [47.3769, 8.5417], "geneva": [46.2044, 6.1432],
  "vals": [46.6224, 9.1811], "montreux": [46.4312, 6.9107],
  "austria": [47.5162, 14.5501], "vienna": [48.2082, 16.3738], "greece": [39.0742, 21.8243],
  "athens": [37.9838, 23.7275], "russia": [61.524, 105.3188], "moscow": [55.7558, 37.6173],
  "st petersburg": [59.9343, 30.3351], "saint petersburg": [59.9343, 30.3351],
  "poland": [51.9194, 19.1451], "warsaw": [52.2297, 21.0122], "czech republic": [49.8175, 15.473],
  "prague": [50.0755, 14.4378], "hungary": [47.1625, 19.5033], "budapest": [47.4979, 19.0402],
  "sweden": [60.1282, 18.6435], "stockholm": [59.3293, 18.0686], "denmark": [56.2639, 9.5018],
  "copenhagen": [55.6761, 12.5683], "norway": [60.472, 8.4689], "oslo": [59.9139, 10.7522],
  "finland": [61.9241, 25.7482], "helsinki": [60.1699, 24.9384], "utrecht": [52.0907, 5.1214],
  "chartres": [48.4469, 1.4892], "verona": [45.4384, 10.9916], "luxor": [25.6872, 32.6396],
  "deir el-bahari": [25.7389, 32.6069], "agra": [27.1767, 78.0081],
  "mill run": [39.9065, -79.4681], "madison": [43.0731, -89.4012], "scottsdale": [33.4942, -111.9261],
  "hiroshima": [34.3853, 132.4553], "la jolla": [32.8328, -117.2713],
  "kanazawa": [36.5614, 136.6562], "sendai": [38.2682, 140.8694], "kobe": [34.6901, 135.1955],
  "metz": [49.1193, 6.1757], "ningbo": [29.8683, 121.544], "chengdu": [30.5728, 104.0668],
  "united states": [37.0902, -95.7129], "usa": [37.0902, -95.7129], "america": [37.0902, -95.7129],
  "new york": [40.7128, -74.006], "chicago": [41.8781, -87.6298], "los angeles": [34.0522, -118.2437],
  "san francisco": [37.7749, -122.4194], "washington": [38.9072, -77.0369],
  "boston": [42.3601, -71.0589], "philadelphia": [39.9526, -75.1652],
  "miami": [25.7617, -80.1918], "seattle": [47.6062, -122.3321],
  "canada": [56.1304, -106.3468], "toronto": [43.6532, -79.3832],
  "montreal": [45.5017, -73.5673], "vancouver": [49.2827, -123.1207],
  "mexico": [23.6345, -102.5528], "mexico city": [19.4326, -99.1332],
  "brazil": [-14.235, -51.9253], "brasilia": [-15.8267, -47.9218],
  "sao paulo": [-23.5505, -46.6333], "rio de janeiro": [-22.9068, -43.1729],
  "argentina": [-38.4161, -63.6167], "buenos aires": [-34.6037, -58.3816],
  "chile": [-35.6751, -71.543], "peru": [-9.19, -75.0152],
  "china": [35.8617, 104.1954], "beijing": [39.9042, 116.4074],
  "shanghai": [31.2304, 121.4737], "hong kong": [22.3193, 114.1694],
  "japan": [36.2048, 138.2529], "tokyo": [35.6762, 139.6503],
  "kyoto": [35.0116, 135.7681], "osaka": [34.6937, 135.5023],
  "korea": [35.9078, 127.7669], "south korea": [35.9078, 127.7669], "seoul": [37.5665, 126.978],
  "india": [20.5937, 78.9629], "delhi": [28.7041, 77.1025], "mumbai": [19.076, 72.8777], "pune": [18.5204, 73.8567],
  "singapore": [1.3521, 103.8198], "egypt": [26.8206, 30.8025], "cairo": [30.0444, 31.2357],
  "turkey": [38.9637, 35.2433], "istanbul": [41.0082, 28.9784],
  "iran": [32.4279, 53.688], "iraq": [33.2232, 43.6793],
  "israel": [31.0461, 34.8516], "jerusalem": [31.7683, 35.2137],
  "saudi arabia": [23.8859, 45.0792], "dubai": [25.2048, 55.2708],
  "south africa": [-30.5595, 22.9375], "cape town": [-33.9249, 18.4241],
  "morocco": [31.7917, -7.0926], "marrakech": [31.6295, -7.9811],
  "australia": [-25.2744, 133.7751], "sydney": [-33.8688, 151.2093],
  "melbourne": [-37.8136, 144.9631], "new zealand": [-40.9006, 174.886],
  "acapulco": [16.8531, -99.8237], "oakland": [37.8044, -122.2712],
  "berkeley": [37.8715, -122.273], "idyllwild": [33.7439, -116.7156],
  "grass valley": [39.2191, -121.0608], "chestnut hill": [40.0713, -75.2068],
  "san vito d'altivole": [45.7167, 11.9167], "inujima": [34.5167, 133.9833],
  "san simeon": [35.6444, -121.1897], "california": [36.7783, -119.4179],
  "new haven": [41.3082, -72.9282], "buffalo": [42.8864, -78.8784],
  "columbus": [39.961, -82.9988], "pittsburgh": [40.4406, -79.9959],
  "minneapolis": [44.9778, -93.265], "detroit": [42.3314, -83.0458],
  "cincinnati": [39.1031, -84.512], "dallas": [32.7767, -96.797],
  "houston": [29.7604, -95.3698], "denver": [39.7392, -104.9903],
  "phoenix": [33.4484, -112.074], "portland": [45.5051, -122.675],
  "new orleans": [29.9511, -90.0715], "baltimore": [39.2904, -76.6122],
  "richmond": [37.5407, -77.436], "atlanta": [33.749, -84.388],
  "guangzhou": [23.1291, 113.2644], "shenzhen": [22.5431, 114.0579],
  "wuhan": [30.5928, 114.3055], "nanjing": [32.0603, 118.7969],
  "taipei": [25.0329, 121.5654], "taiwan": [23.6978, 120.9605],
  "bangalore": [12.9716, 77.5946],
  "chennai": [13.0827, 80.2707], "kolkata": [22.5726, 88.3639],
  "kuala lumpur": [3.139, 101.6869], "malaysia": [4.2105, 101.9758],
  "indonesia": [-0.7893, 113.9213], "jakarta": [-6.2088, 106.8456],
  "thailand": [15.87, 100.9925], "bangkok": [13.7563, 100.5018],
  "vietnam": [14.0583, 108.2772], "hanoi": [21.0285, 105.8542],
  "philippines": [12.8797, 121.774], "manila": [14.5995, 120.9842],
  "nigeria": [9.082, 8.6753], "kenya": [-0.0236, 37.9062],
  "ethiopia": [9.145, 40.4897], "ghana": [7.9465, -1.0232],
  "niteroi": [-22.8838, -43.1036], "niterói": [-22.8838, -43.1036],
  "sao paolo": [-23.5505, -46.6333],
  "noormarkku": [61.5839, 21.8747],
  "baku": [40.4093, 49.8671], "azerbaijan": [40.1431, 47.5769],
  "iceland": [64.9631, -19.0208], "reykjavik": [64.1355, -21.8954],
  "new caledonia": [-20.904, 165.618], "noumea": [-22.2758, 166.458],
  "uae": [23.4241, 53.8478],
};

const BUILDING_COORDINATES: Record<string, [number, number]> = {
  "BLD-077": [51.4226, -0.0755], // Crystal Palace
  "BLD-095": [51.5200, -0.0930], // Barbican Estate
  "BLD-106": [51.5045, -0.1753], // Serpentine Pavilion 2013
  "BLD-113": [51.5136, -0.0827], // Lloyd's Building
  "BLD-156": [51.4556, 0.1286], // Red House, Bexleyheath
  "BLD-168": [51.5045, -0.0865], // The Shard
  "BLD-022": [48.8538, 2.3331], // Le salon de verre
  "BLD-066": [48.8510, 2.3150], // Maison de Verre
  "BLD-069": [48.9231, 2.2586], // Villa Dall'Ava
  "BLD-084": [48.8566, 2.3126], // Les Invalides
  "BLD-096": [48.8606, 2.3522], // Centre Pompidou
  "BLD-110": [48.8610, 2.3358], // Louvre Pyramid
  "BLD-141": [48.8462, 2.3450], // Panthéon
  "BLD-153": [48.8554, 2.3450], // Sainte-Chapelle
};

function getCoordinates(location?: string): [number, number] | null {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();
  if (LOCATION_COORDINATES[normalized]) return LOCATION_COORDINATES[normalized];
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) return coords;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Internal marker type
// ---------------------------------------------------------------------------
interface MapMarker {
  uid: string;
  sourceId: string;
  buildingId: string;
  movementId: string;
  name: string;
  imageUrl?: string;
  lat: number;
  lng: number;
  color: string;
  eraIndex: number;
  macroId: string;
  hasExactCoordinates: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MapViewProps {
  buildings: TimelineBuilding[];
  movements: ChildMovement[];
  macros: MacroMovement[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MapView({ buildings, movements, macros }: MapViewProps) {
  const { filters, setFilters } = useSharedFilters();
  const [zoom, setZoom] = useState(2);
  const compactMarkers = zoom <= 2;

  // Sorted macros (chronological)
  const sortedMacros = useMemo(
    () => [...macros].sort((a, b) => (a.start ?? 0) - (b.start ?? 0)),
    [macros]
  );

  // Legacy name → index fallback
  const macroIndexByName = useMemo(() => {
    const map = new Map<string, number>();
    sortedMacros.forEach((m, i) => map.set(m.name.toLowerCase(), i));
    return map;
  }, [sortedMacros]);

  // movement → macro index
  const movementMacroIndex = useMemo(() => {
    const map = new Map<string, number>(); // movementId → macro index
    const macroIdMap = new Map<string, number>();
    sortedMacros.forEach((m, i) => macroIdMap.set(m.id, i));

    movements.forEach((movement) => {
      let idx = -1;
      if (movement.parentMacroId) {
        idx = macroIdMap.get(movement.parentMacroId) ?? -1;
      }
      if (idx < 0 && movement.parent) {
        idx = macroIdMap.get(movement.parent) ?? macroIndexByName.get(movement.parent.toLowerCase()) ?? -1;
      }
      if (idx >= 0) map.set(movement.id, idx);
    });
    return map;
  }, [movements, sortedMacros, macroIndexByName]);

  // building → macro index
  const buildingMacroIndex = useMemo(() => {
    const map = new Map<string, number>(); // buildingId → macro index
    movements.forEach((movement) => {
      const idx = movementMacroIndex.get(movement.id) ?? -1;
      if (idx >= 0) {
        (movement.works ?? []).forEach((work) => map.set(work.id, idx));
      }
    });
    return map;
  }, [movements, movementMacroIndex]);

  // All markers derived from buildings — include movementId for filtering.
  // Exact-coordinate duplicates are spread into a small circle so they separate
  // when zoomed in rather than stacking forever on the same pixel.
  const markers = useMemo<MapMarker[]>(() => {
    const result: MapMarker[] = [];
    buildings.forEach((building, i) => {
      const sourceId = typeof building.raw?.ID === "string" ? building.raw.ID : building.id;
      const exactCoordinates = BUILDING_COORDINATES[sourceId] ||
        ((building.lat !== undefined && building.lng !== undefined)
          ? [building.lat, building.lng] as [number, number]
          : null);
      const coords: [number, number] | null = exactCoordinates ||
        getCoordinates(building.city) ||
            getCoordinates(building.city?.split(",")[0]?.trim()) ||
            getCoordinates(building.location) ||
            getCoordinates(building.country);
      if (!coords) return;

      const idx = buildingMacroIndex.get(building.id) ?? -1;
      const macroId = idx >= 0 ? (sortedMacros[idx]?.id ?? "") : "";

      result.push({
        uid: `${building.id}-${i}`,
        sourceId,
        buildingId: building.id,
        movementId: building.movementId ?? "",
        name: building.name,
        imageUrl: building.imageUrl,
        lat: coords[0],
        lng: coords[1],
        color: ERA_COLORS[idx >= 0 ? idx % ERA_COLORS.length : 0],
        eraIndex: idx,
        macroId,
        hasExactCoordinates: Boolean(exactCoordinates),
      });
    });

    // Group markers that share the same coordinates (within ~10 m)
    // and spread each group into a small circle so zoom can separate them.
    const PRECISION = 4; // ~11 m at equator
    const SPIRAL_RADIUS_DEG = 0.0004; // ~44 m — tight enough to look co-located, wide enough to be clickable
    const groups = new Map<string, MapMarker[]>();
    result.filter((m) => m.hasExactCoordinates).forEach((m) => {
      const key = `${m.lat.toFixed(PRECISION)},${m.lng.toFixed(PRECISION)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    });
    groups.forEach((group) => {
      if (group.length <= 1) return;
      // Arrange in a circle starting at 12 o'clock, equally spaced
      group.forEach((m, i) => {
        const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
        m.lat += SPIRAL_RADIUS_DEG * Math.cos(angle);
        // Correct for longitude compression at higher latitudes
        m.lng += (SPIRAL_RADIUS_DEG * Math.sin(angle)) / Math.cos((m.lat * Math.PI) / 180);
      });
    });

    return result;
  }, [buildings, buildingMacroIndex, sortedMacros]);

  // Filtered markers: era AND movement AND query
  const visibleMarkers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const matching = markers.filter((m) => {
      if (filters.eraId && m.macroId !== filters.eraId) return false;
      if (filters.movementId && m.movementId !== filters.movementId) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const unique = new Map<string, MapMarker>();
    matching.forEach((marker) => {
      if (!unique.has(marker.sourceId)) unique.set(marker.sourceId, marker);
    });
    return [...unique.values()];
  }, [markers, filters.eraId, filters.movementId, filters.query]);

  // Movement map for DetailPanel lookup
  const movementMap = useMemo(() => {
    const map = new Map<string, ChildMovement>();
    movements.forEach((m) => map.set(m.id, m));
    return map;
  }, [movements]);

  // macro accent color by movementId
  const macroColorByMovId = useMemo(() => {
    const map = new Map<string, string>();
    sortedMacros.forEach((macro, i) => {
      (macro.children ?? []).forEach((movId) =>
        map.set(movId, ERA_COLORS[i % ERA_COLORS.length])
      );
    });
    return map;
  }, [sortedMacros]);

  // Selected building for DetailPanel
  const selectedBuilding = useMemo(() => {
    if (!filters.selectedId) return null;
    return buildings.find((b) => b.id === filters.selectedId) ?? null;
  }, [buildings, filters.selectedId]);

  const selectedMovement = useMemo(
    () =>
      selectedBuilding?.movementId
        ? movementMap.get(selectedBuilding.movementId)
        : null,
    [selectedBuilding, movementMap]
  );

  const selectedColor = useMemo(
    () =>
      selectedBuilding?.movementId
        ? macroColorByMovId.get(selectedBuilding.movementId) ?? "var(--apple-blue)"
        : "var(--apple-blue)",
    [selectedBuilding, macroColorByMovId]
  );

  // No-token fallback
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div className="map-loading map-fill">
        <p>Mapbox token required</p>
        <small>Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to <code>.env.local</code></small>
      </div>
    );
  }

  return (
    <>
      {/* Detail panel — outside map container so it layers above everything */}
      {selectedBuilding && (
        <DetailPanel
          item={selectedBuilding}
          movement={selectedMovement}
          color={selectedColor}
          onClose={() => setFilters({ selectedId: "" })}
          crossLinkView="timeline"
        />
      )}

      <div className="map-canvas">
        <MapGL
          mapboxAccessToken={token}
          initialViewState={{ longitude: 15, latitude: 25, zoom: 2 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          projection="mercator"
          attributionControl={false}
          renderWorldCopies={false}
          minZoom={1}
          onZoom={(event) => setZoom(event.viewState.zoom)}
        >
          <NavigationControl position="bottom-left" showCompass={false} />

          {visibleMarkers.map((marker) => (
            <Marker
              key={`building-marker-${marker.uid}`}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="center"
            >
              <button
                type="button"
                className={`map-building-marker${marker.hasExactCoordinates ? "" : " map-building-marker--approximate"}`}
                style={{
                  "--marker-color": marker.color,
                  "--marker-size": compactMarkers ? "16px" : "32px",
                } as React.CSSProperties}
                onClick={() => setFilters({ selectedId: marker.buildingId })}
                title={marker.name}
                aria-label={`Open ${marker.name}`}
              >
                {marker.imageUrl ? (
                  <img src={marker.imageUrl} alt="" loading="lazy" />
                ) : (
                  <span>{marker.name.charAt(0) || "?"}</span>
                )}
              </button>
            </Marker>
          ))}

        </MapGL>

        {/* Stats pill */}
        <div className="map-stats-pill" aria-live="polite" aria-atomic="true">
          <strong>{visibleMarkers.length}</strong>
          <span>
            {filters.eraId || filters.movementId || filters.query
              ? "filtered"
              : "buildings mapped"}
          </span>
        </div>
      </div>
    </>
  );
}
