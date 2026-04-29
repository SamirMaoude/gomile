"use client";

import { useEffect, useMemo, useState } from "react";

import SimpleBarChart from "@/components/ui/charts/barchart";

import {
  getDeliveriesCountByDay,
  type ChartDataItem,
  type Order,
} from "./AdminFunctions";
import { getAllDriverOrders } from "../admin";

type DeliveriesChartProps = {
  orders?: Order[];
  referenceDate?: Date;
};

function getCurrentWeekDays(referenceDate = new Date()) {
  const currentDay = referenceDate.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(referenceDate);

  monday.setHours(0, 0, 0, 0);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date);
}

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

  const data = useMemo<ChartDataItem[]>(() => {
    return getCurrentWeekDays(referenceDate).map((date) => ({
      name: formatWeekday(date),
      value: getDeliveriesCountByDay(orders, date),
    }));
  }, [orders, referenceDate]);

  if (isLoading) {
    return <p>Chargement des livraisons...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return <SimpleBarChart data={data} />;
}
