const forwardCache = new Map();
const reverseCache = new Map();

/**
 * Converts a French address string to { latitude, longitude } using api-adresse.data.gouv.fr.
 * Returns null if geocoding fails or address is empty.
 * Results are cached in-memory to avoid redundant requests during polling.
 */
export async function geocodeAddress(address) {
  if (!address) return null;
  if (forwardCache.has(address)) return forwardCache.get(address);

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features?.length) return null;

    const [lng, lat] = data.features[0].geometry.coordinates;
    const coords = { latitude: lat, longitude: lng };
    forwardCache.set(address, coords);
    return coords;
  } catch {
    return null;
  }
}

/**
 * Converts { latitude, longitude } to a human-readable address string.
 * Uses api-adresse.data.gouv.fr reverse geocoding.
 * Returns null if the call fails or no result.
 */
export async function reverseGeocodeCoords(latitude, longitude) {
  const key = `${latitude},${longitude}`;
  if (reverseCache.has(key)) return reverseCache.get(key);

  try {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const label = data.features?.[0]?.properties?.label ?? null;
    if (label) reverseCache.set(key, label);
    return label;
  } catch {
    return null;
  }
}
