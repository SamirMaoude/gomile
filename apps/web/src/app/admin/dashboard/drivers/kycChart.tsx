"use client";

import PieChartWithCustomizedLabel from "@/components/ui/charts/piechart";

import type { Driver } from "../admin";
import { getKycStatusChartData } from "./AdminFunctions";

type KycChartProps = {
  drivers: Driver[];
};

export default function KycChart({ drivers }: KycChartProps) {
  const data = getKycStatusChartData(drivers);

  return <PieChartWithCustomizedLabel data={data} />;
}
