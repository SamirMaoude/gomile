"use client";

import { useEffect, useMemo, useRef } from "react";
import type { OrderStatus } from "../../../../shared/order-contracts";

type OrderStatusPayload = {
  orderId: string;
  status: OrderStatus;
};

type WsTokenResponse = {
  wsToken: string;
};

type Socket = {
  disconnect: () => void;
  emit: (event: string, payload?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
};

type SocketFactory = (
  url: string,
  options: {
    auth: { token: string };
    transports: string[];
  },
) => Socket;

declare global {
  interface Window {
    io?: SocketFactory;
  }
}

type UseOrderStatusSocketOptions = {
  enabled?: boolean;
  onStatusChange: (payload: OrderStatusPayload) => void;
  orderIds: string[];
};

const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getOrderStatusSocketUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

let socketClientScriptPromise: Promise<SocketFactory> | null = null;

function loadSocketClientScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Socket.IO browser client unavailable."));
  }

  if (window.io) {
    return Promise.resolve(window.io);
  }

  if (socketClientScriptPromise) {
    return socketClientScriptPromise;
  }

  socketClientScriptPromise = new Promise<SocketFactory>((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `${getOrderStatusSocketUrl()}/socket.io/socket.io.js`;
    script.onload = () => {
      if (window.io) {
        resolve(window.io);
        return;
      }

      reject(new Error("Socket.IO browser client did not initialize."));
    };
    script.onerror = () => {
      socketClientScriptPromise = null;
      reject(new Error("Impossible de charger le client Socket.IO."));
    };

    document.head.appendChild(script);
  });

  return socketClientScriptPromise;
}

async function fetchWsToken(signal: AbortSignal) {
  const response = await fetch("/api/ws-token", {
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer le token WebSocket.");
  }

  return ((await response.json()) as WsTokenResponse).wsToken;
}

function getUniqueOrderIds(orderIds: string[]) {
  return Array.from(new Set(orderIds.filter(Boolean))).sort();
}

function isOrderStatusPayload(payload: unknown): payload is OrderStatusPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<OrderStatusPayload>;
  return (
    typeof candidate.orderId === "string" &&
    typeof candidate.status === "string"
  );
}

export function useOrderStatusSocket({
  enabled = true,
  onStatusChange,
  orderIds,
}: UseOrderStatusSocketOptions) {
  const onStatusChangeRef = useRef(onStatusChange);
  const orderIdsKey = useMemo(
    () => getUniqueOrderIds(orderIds).join("|"),
    [orderIds],
  );

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    const joinedOrderIds = orderIdsKey ? orderIdsKey.split("|") : [];

    if (!enabled || joinedOrderIds.length === 0) {
      return;
    }

    const abortController = new AbortController();
    let socket: Socket | null = null;

    async function connect() {
      const [createSocket, wsToken] = await Promise.all([
        loadSocketClientScript(),
        fetchWsToken(abortController.signal),
      ]);

      if (abortController.signal.aborted) {
        return;
      }

      socket = createSocket(getOrderStatusSocketUrl(), {
        auth: {
          token: `Bearer ${wsToken}`,
        },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        joinedOrderIds.forEach((orderId) => {
          socket?.emit("join-order", { orderId });
        });
      });

      socket.on("order:status", (payload) => {
        if (!isOrderStatusPayload(payload)) {
          return;
        }

        onStatusChangeRef.current(payload);
      });
    }

    void connect().catch(() => {
      // REST polling/manual refresh still keeps the UI usable if realtime is unavailable.
    });

    return () => {
      abortController.abort();
      socket?.disconnect();
    };
  }, [enabled, orderIdsKey]);
}

export type { OrderStatusPayload };
