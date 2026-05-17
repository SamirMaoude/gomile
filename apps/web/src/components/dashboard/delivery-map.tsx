"use client";

import type { MerchantMapMarker } from "@/components/dashboard/dashboard-overview.model";
import { useEffect, useRef, useState } from "react";

type LeafletModule = typeof import("leaflet");

const DEFAULT_MAP_CENTER: [number, number] = [48.8566, 2.3522];
const DEFAULT_MAP_ZOOM = 5;
const USER_LOCATION_ZOOM = 14;
const APPROXIMATE_USER_LOCATION_ZOOM = 10;

type UserLocationKind = "approximate" | "precise";

type IpLocationResponse = {
  city?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getThemeColor(variableName: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return value || fallback;
}

function popupToneLabel(tone: MerchantMapMarker["tone"]) {
  if (tone === "green") return "En route";
  if (tone === "amber") return "Attention";
  return "Incident";
}

function popupToneClass(tone: MerchantMapMarker["tone"]) {
  if (tone === "green") return "gomile-map-popup__pill--green";
  if (tone === "amber") return "gomile-map-popup__pill--amber";
  return "gomile-map-popup__pill--red";
}

function markerColors(tone: MerchantMapMarker["tone"]) {
  const border = getThemeColor("--color-bg-card", "#FFFFCC");

  if (tone === "green") {
    return {
      fill: getThemeColor("--color-primary", "#0FB12A"),
      border,
    };
  }

  if (tone === "amber") {
    return {
      fill: getThemeColor("--color-warning", "#f59e0b"),
      border,
    };
  }

  return {
    fill: getThemeColor("--color-danger", "#b91c1c"),
    border,
  };
}

function buildPopupContent(marker: MerchantMapMarker) {
  const status = marker.status ?? popupToneLabel(marker.tone);
  const destination = marker.destination ?? "Point de livraison";
  const metaLabel = marker.metaLabel ?? "Mise à jour";
  const metaValue = marker.metaValue
    ? `<div class="gomile-map-popup__eta">${escapeHtml(marker.metaValue)}</div>`
    : "";

  return `
    <div class="gomile-map-popup">
      <div class="gomile-map-popup__top">
        <div class="gomile-map-popup__id">${escapeHtml(marker.id)}</div>
        <span class="gomile-map-popup__pill ${popupToneClass(marker.tone)}">
          ${escapeHtml(status)}
        </span>
      </div>
      <div class="gomile-map-popup__destination">${escapeHtml(destination)}</div>
      <div class="gomile-map-popup__caption">${escapeHtml(metaLabel)}</div>
      ${metaValue}
    </div>
  `;
}

async function fetchApproximateUserLocation(): Promise<{
  city?: string;
  country?: string;
  lat: number;
  lng: number;
} | null> {
  try {
    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as IpLocationResponse;

    if (
      !Number.isFinite(data.latitude)
      || !Number.isFinite(data.longitude)
    ) {
      return null;
    }

    return {
      city: data.city,
      country: data.country_name,
      lat: data.latitude as number,
      lng: data.longitude as number,
    };
  } catch {
    return null;
  }
}

function buildUserLocationPopup() {
  return `
    <div class="gomile-map-popup">
      <div class="gomile-map-popup__top">
        <div class="gomile-map-popup__id">Votre position</div>
      </div>
    </div>
  `;
}

export default function DeliveryMap({
  markers = [],
  showUserLocation = true,
}: {
  markers?: MerchantMapMarker[];
  showUserLocation?: boolean;
}) {
  const [isMapReady, setIsMapReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayerRef = useRef<import("leaflet").FeatureGroup | null>(null);
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const hasCenteredOnUserRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let watchPositionId: number | null = null;

    async function initMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled || !containerRef.current) {
        return;
      }

      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 2,
        maxZoom: 19,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      map.attributionControl.setPrefix(false);

      const markerLayer = L.featureGroup().addTo(map);

      mapRef.current = map;
      markerLayerRef.current = markerLayer;

      function placeUserMarker(
        coordinates: [number, number],
        kind: UserLocationKind,
      ) {
        if (!hasCenteredOnUserRef.current) {
          map.setView(
            coordinates,
            kind === "precise"
              ? USER_LOCATION_ZOOM
              : APPROXIMATE_USER_LOCATION_ZOOM,
            { animate: true },
          );
          hasCenteredOnUserRef.current = true;
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(coordinates);
          userMarkerRef.current.setPopupContent(buildUserLocationPopup());
          return;
        }

        userMarkerRef.current = L.circleMarker(
          coordinates,
          {
            radius: kind === "precise" ? 9 : 11,
            fillColor: kind === "precise" ? "#2563eb" : "#7c3aed",
            color: "#ffffff",
            dashArray: kind === "precise" ? undefined : "4 4",
            weight: 3,
            fillOpacity: kind === "precise" ? 0.95 : 0.78,
          },
        )
          .bindPopup(
            buildUserLocationPopup(),
            {
            closeButton: true,
            offset: [0, -8],
            className: "gomile-leaflet-popup",
            maxWidth: 280,
            },
          )
          .addTo(map);
      }

      async function placeApproximateUserMarker() {
        const approximateLocation = await fetchApproximateUserLocation();

        if (cancelled || !approximateLocation) {
          return;
        }

        placeUserMarker(
          [approximateLocation.lat, approximateLocation.lng],
          "approximate",
        );
      }

      if (showUserLocation) {
        if ("geolocation" in navigator) {
          watchPositionId = navigator.geolocation.watchPosition(
            (position) => {
              if (cancelled) {
                return;
              }

              const userCoordinates: [number, number] = [
                position.coords.latitude,
                position.coords.longitude,
              ];

              placeUserMarker(userCoordinates, "precise");
            },
            () => {
              void placeApproximateUserMarker();
            },
            {
              enableHighAccuracy: true,
              maximumAge: 5_000,
              timeout: 10_000,
            },
          );
        } else {
          void placeApproximateUserMarker();
        }
      }

      window.requestAnimationFrame(() => {
        if (cancelled) return;

        map.invalidateSize();
        setIsMapReady(true);
      });

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          window.requestAnimationFrame(() => {
            if (!cancelled) {
              map.invalidateSize();
            }
          });
        });
        resizeObserver.observe(containerRef.current);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (watchPositionId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchPositionId);
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerLayerRef.current = null;
      userMarkerRef.current = null;
      leafletRef.current = null;
      hasCenteredOnUserRef.current = false;
      setIsMapReady(false);
    };
  }, [showUserLocation]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!isMapReady || !L || !map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    markers.forEach((marker) => {
      const colors = markerColors(marker.tone);

      const leafletMarker = L.circleMarker([marker.lat, marker.lng], {
        radius: 10,
        fillColor: colors.fill,
        color: colors.border,
        weight: 3,
        fillOpacity: 0.95,
      });

      leafletMarker.bindPopup(buildPopupContent(marker), {
        closeButton: true,
        offset: [0, -8],
        className: "gomile-leaflet-popup",
        maxWidth: 280,
      });

      leafletMarker.addTo(markerLayer);
    });

    if (!hasCenteredOnUserRef.current && markers.length > 0) {
      map.fitBounds(markerLayer.getBounds(), {
        padding: [32, 32],
        maxZoom: 15,
      });
    }
  }, [markers, isMapReady]);

  return <div ref={containerRef} className="gomile-leaflet-map h-full w-full" />;
}

export type { MerchantMapMarker as MapMarkerData };
