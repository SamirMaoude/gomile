// src/lib/api/drivers.ts
const urlBase = "http://localhost:3000";
export type DriverStatus = "approved" | "pending" | "denied";

export type Driver = {
  id: string;
  name: string;
  email: string;
  status: DriverStatus;
};

function getApiUrl(path: string): string {
    return `${urlBase}${path}`;
}

export async function getDriversList(): Promise<Driver[]> {
    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl("/api/drivers"), {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-access-token": token } : {}),
        },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer la liste des drivers");
    }

    return res.json();
}

// src/lib/api/orders.ts

export type OrderStatus = "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";

export type Order = {
  id: string;
  driverId: string;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
};

export async function getDriverOrdersList(driverId: string): Promise<Order[]> {
  const token = localStorage.getItem("token");

  const res = await fetch(
    getApiUrl(`/admin/drivers/${driverId}/orders`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-access-token": token } : {}),
      },
    }
  );

  if (!res.ok) {
    throw new Error("Impossible de récupérer les commandes du driver");
  }

  return res.json();
}