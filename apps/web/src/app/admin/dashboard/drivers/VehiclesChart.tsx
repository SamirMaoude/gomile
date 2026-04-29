"use client";

import PieChartWithCustomizedLabel from "@/components/ui/charts/piechart";

import type { Driver } from "../admin";
import { getTransportChartData } from "./AdminFunctions";

type VehiclesChartProps = {
  drivers: Driver[];
};

export default function VehiclesChart({ drivers }: VehiclesChartProps) {
  const data = getTransportChartData(drivers);

  return <PieChartWithCustomizedLabel data={data} />;
}
