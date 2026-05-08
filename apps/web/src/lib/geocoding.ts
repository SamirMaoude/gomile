export type GeocodedPosition = {
  lat: number;
  lng: number;
};

type GeoJsonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
};

type GeoJsonResponse = {
  features?: GeoJsonFeature[];
};

const FRENCH_ADDRESS_API_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";
const PHOTON_API_ENDPOINT = "https://photon.komoot.io/api/";
const geocodeCache = new Map<string, GeocodedPosition | null>();

function parseFeatureCoordinates(feature: GeoJsonFeature | undefined) {
  const coordinates = feature?.geometry?.coordinates;

  if (!coordinates) {
    return null;
  }

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

async function fetchFrenchAddressPosition(
  address: string,
  signal?: AbortSignal,
) {
  const url = new URL(FRENCH_ADDRESS_API_ENDPOINT);
  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");
  url.searchParams.set("type", "housenumber");

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GeoJsonResponse;
  return parseFeatureCoordinates(data.features?.[0]);
}

async function fetchWorldwideAddressPosition(
  address: string,
  signal?: AbortSignal,
) {
  const url = new URL(PHOTON_API_ENDPOINT);
  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GeoJsonResponse;
  return parseFeatureCoordinates(data.features?.[0]);
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodedPosition | null> {
  const normalizedAddress = address.trim();

  if (normalizedAddress.length < 5) {
    return null;
  }

  const cacheKey = normalizedAddress.toLocaleLowerCase("fr-FR");

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  let position: GeocodedPosition | null = null;

  try {
    position = await fetchFrenchAddressPosition(normalizedAddress, signal);
  } catch {
    position = null;
  }

  if (!position) {
    try {
      position = await fetchWorldwideAddressPosition(normalizedAddress, signal);
    } catch {
      position = null;
    }
  }

  geocodeCache.set(cacheKey, position);
  return position;
}
