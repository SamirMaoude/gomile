const cache = new Map();

/**
 * Converts a French address string to { latitude, longitude } using api-adresse.data.gouv.fr.
 * Returns null if geocoding fails or address is empty.
 * Results are cached in-memory to avoid redundant requests during polling.
 */
export async function geocodeAddress(address) {
  if (!address) return null;
  if (cache.has(address)) return cache.get(address);

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features?.length) return null;

    const [lng, lat] = data.features[0].geometry.coordinates;
    const coords = { latitude: lat, longitude: lng };
    cache.set(address, coords);
    return coords;
  } catch {
    return null;
  }
}
