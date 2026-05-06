const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

function toCoordString(points) {
  return points.map((p) => `${p.longitude},${p.latitude}`).join(';');
}

export function formatDistanceKm(meters) {
  if (!Number.isFinite(meters)) return '--';
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDurationMin(seconds) {
  if (!Number.isFinite(seconds)) return '--';
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export async function getDrivingRoute(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const coords = toCoordString(points);
  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM request failed: ${response.status}`);
  }

  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route) {
    return null;
  }

  const routeCoordinates = (route.geometry?.coordinates || []).map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));

  return {
    coordinates: routeCoordinates,
    distance: route.distance,
    duration: route.duration,
  };
}
