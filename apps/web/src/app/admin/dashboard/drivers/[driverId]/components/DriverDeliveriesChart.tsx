"use client";

import { useEffect, useMemo, useState } from "react";

import SimpleBarChart from "@/components/ui/charts/barchart";
import Typography from "@/components/ui/design-system/typography";

import { getDriverOrdersList } from "../../../admin";
import {
  getDeliveriesCountByMonth,
  type ChartDataItem,
  type Order,
} from "../../AdminFunctions";

type DriverDeliveriesChartProps = {
  driverId: string;
  referenceDate?: Date;
};

function getRecentMonths(referenceDate = new Date()) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(referenceDate);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(referenceDate.getMonth() - (5 - index));
    return date;
  });
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export default function DriverDeliveriesChart({
  driverId,
  referenceDate,
}: DriverDeliveriesChartProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDriverOrdersList(driverId, "finished")
      .then((driverOrders) => {
        setOrders(driverOrders);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, [driverId]);

  const data = useMemo<ChartDataItem[]>(() => {
    return getRecentMonths(referenceDate).map((month) => ({
      name: formatMonth(month),
      value: getDeliveriesCountByMonth(orders, month),
    }));
  }, [orders, referenceDate]);

  return (
    <section className="admin-driver-detail-panel">
      <Typography
        variant="h3"
        Component="h2"
        className="admin-driver-detail-panel-title"
      >
        Historique des livraisons
      </Typography>

      {isLoading ? (
        <p className="admin-driver-detail-feedback">Chargement des livraisons...</p>
      ) : error ? (
        <p className="admin-driver-detail-error">{error}</p>
      ) : (
        <div className="admin-driver-detail-chart">
          <SimpleBarChart data={data} />
        </div>
      )}
    </section>
  );
}
