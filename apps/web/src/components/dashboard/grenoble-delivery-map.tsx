"use client";

import type { MerchantMapMarker } from "@/components/dashboard/dashboard-overview.model";
import { useEffect, useRef, useState } from "react";

type LeafletModule = typeof import("leaflet");

const GRENOBLE_CENTER: [number, number] = [45.1885, 5.7245];

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
  const metaLabel = marker.metaLabel ?? "Mise a jour";
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

export default function GrenobleDeliveryMap({
  markers = [],
}: {
  markers?: MerchantMapMarker[];
}) {
  const [isMapReady, setIsMapReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

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
        center: GRENOBLE_CENTER,
        zoom: 13,
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

      const markerLayer = L.layerGroup().addTo(map);

      mapRef.current = map;
      markerLayerRef.current = markerLayer;

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

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerLayerRef.current = null;
      leafletRef.current = null;
      setIsMapReady(false);
    };
  }, []);

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
  }, [markers, isMapReady]);

  return <div ref={containerRef} className="gomile-leaflet-map h-full w-full" />;
}

export type { MerchantMapMarker as MapMarkerData };
