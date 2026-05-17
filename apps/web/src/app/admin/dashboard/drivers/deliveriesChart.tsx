"use client";

import { useCallback, useEffect, useState } from "react";

import AdminWeeklyBarChart from "@/components/admin/dashboard/WeekleyBarChart";

import { getAllDriverOrders } from "../admin";
import { getDeliveriesCountByDay, type Order } from "./AdminFunctions";

type DeliveriesChartProps = {
  orders?: Order[];
  referenceDate?: Date;
};

export default function DeliveriesChart({
  orders: providedOrders,
  referenceDate,
}: DeliveriesChartProps) {
  const [fetchedOrders, setFetchedOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!providedOrders);
  const orders = providedOrders ?? fetchedOrders;

  useEffect(() => {
    if (providedOrders) {
      return;
    }

    getAllDriverOrders()
      .then((driverOrders) => setFetchedOrders(driverOrders))
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, [providedOrders]);

  const getValueForDay = useCallback((date: Date) => {
    return getDeliveriesCountByDay(orders, date);
  }, [orders]);

  if (isLoading) {
    return <p>Chargement des livraisons...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <AdminWeeklyBarChart
      getValueForDay={getValueForDay}
      referenceDate={referenceDate}
    />
  );
}
